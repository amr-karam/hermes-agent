#requires -Version 7.0
<#
.SYNOPSIS
    Diagnostics for the Honcho memory stack on the remote staging host.

.DESCRIPTION
    Every fact this script needs lives in the CONSTANTS block below. Nothing that
    can change is hard-coded inside a function body, so a host or model swap is a
    one-line edit rather than a find-and-replace across dozens of scripts.

    Two transport decisions worth knowing, because both fix bugs that the previous
    one-off scripts hit repeatedly:

    1. Remote scripts travel over stdin via `bash -s` rather than as an ssh
       argument. Passing multi-line shell through an ssh argument requires escaping
       every quote, dollar sign and backtick, and a single miss produces an error
       far from the cause. Piping to the remote shell removes that bug class.

    2. Anything that needs JSON parsing uses a nested heredoc (`python - <<'PY'`),
       never an inline `python -c "..."`. Escaping quotes inside escaping quotes
       is how the earlier scripts ended up passing malformed code to the parser.

.PARAMETER Verb
    Which diagnostic to run. Defaults to 'report', the full sweep.
    Read-only: report, health, containers, memory, disk, errors, embedding, llm, config
    Mutating (need -Force): backup, clean, swap, firewall

.PARAMETER Force
    Required by every mutating verb. Without it they refuse and change nothing.

.EXAMPLE
    .\remote-honcho.ps1 -Verb report
    .\remote-honcho.ps1 -Verb errors -WindowMinutes 10

.EXAMPLE
    .\remote-honcho.ps1 -Verb clean -Force

.EXAMPLE
    . .\remote-honcho.ps1
    Get-MemorySnapshot
#>

[CmdletBinding()]
param(
    [ValidateSet(
        'report', 'health', 'containers', 'memory', 'disk', 'errors',
        'embedding', 'llm', 'config', 'backup', 'clean', 'swap', 'firewall'
    )]
    [string] $Verb = 'report',

    [ValidateRange(1, 1440)]
    [int] $WindowMinutes = 15,

    # Mutating verbs fail closed without this.
    [switch] $Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ==============================================================================
# CONSTANTS
# Every value that previously appeared as a scattered literal belongs here.
# ==============================================================================

# --- Connection ---------------------------------------------------------------
$script:RemoteHost = 'root@19.16.1.100'

# BatchMode stops ssh blocking on a password prompt in a non-interactive session;
# ConnectTimeout stops a dead host from hanging the whole run.
$script:SshOption = @(
    '-o', 'BatchMode=yes',
    '-o', 'ConnectTimeout=20'
)

# --- Remote paths -------------------------------------------------------------
$script:HonchoEnvFile = '/home/hexa/honcho/.env'

# --- Containers ---------------------------------------------------------------
$script:ApiContainer = 'honcho-api-1'
$script:DeriverContainer = 'honcho-deriver-1'
$script:GitlabContainer = 'hexa-gitlab-19'

# --- Models and endpoints -----------------------------------------------------
# nomic-embed-text emits 768 dimensions, which must equal EMBEDDING_VECTOR_DIMENSIONS
# in the .env. Changing the model means checking that value first.
$script:EmbeddingModel = 'nomic-embed-text'
$script:EmbeddingDimensions = 768

$script:LlmModel = 'nvidia/nemotron-3.5-lightning:free'
$script:OpenRouterBaseUrl = 'https://openrouter.ai/api/v1'

# host.docker.internal does NOT resolve inside these containers. The Docker bridge
# gateway is the only reachable address for the host-side Ollama listener.
$script:DockerBridgeGateway = '172.17.0.1'
$script:OllamaApiUrl = "http://$($script:DockerBridgeGateway):11434/api"

# --- Timeouts -----------------------------------------------------------------
# Each throwaway script previously invented its own value, so "why 120 here and 300
# there" had no answer. These names carry the reason instead.
$script:HttpProbeTimeoutSeconds = 30        # plain health / status endpoints
$script:ModelProbeTimeoutSeconds = 120      # one call, model already resident
$script:ModelColdLoadTimeoutSeconds = 420   # includes reading a 2-10 GB model off disk

# ==============================================================================
# TRANSPORT
# The single place ssh is invoked. Every diagnostic funnels through here.
# ==============================================================================

# Patterns whose VALUES are secrets. Deliberately does NOT match bare `TOKEN`:
# `max_tokens`, `reasoning_tokens`, `prompt_tokens`, `cached_tokens` are token
# counts, not credentials, and they are the numbers that explain the truncation
# bug this script exists to diagnose. A scrubber keyed on TOKEN alone would hide
# exactly the diagnostic it exists to protect.
#
# AWS_SECRET_ACCESS_KEY is the case that forces compound names: the secret word is
# in the middle, not at the end, so the name pattern matches the secret word
# ANYWHERE in the identifier rather than only as a trailing segment. Testing caught
# this -- a name-anchored pattern silently passed the AWS key through.
$script:SecretNamePattern = '(?i)(?:API_?KEY|ACCESS_?KEY|SECRET_?ACCESS_?KEY|SECRET|SECRET_?KEY|PASSWORD|PASSWD|CREDENTIAL|PRIVATE_?KEY|AUTH_?TOKEN|ACCESS_?TOKEN|GITHUB_?TOKEN|GH_?TOKEN|API_?TOKEN)'

# Key prefixes seen in the wild. Prefix matching catches a secret even when the
# variable name looks innocuous (`ANTHROPIC_KEY`, `HF_TOKEN`), which name-based
# matching alone would miss.
#
# Each alternative is `sk-` followed by ZERO OR MORE vendor segments before the body,
# so bare `sk-...`, `sk-proj-...`, `sk-or-v1-...` and `sk-ant-api03-...` all match.
# Segments must allow digits: `or-v1` and `api03` contain them, and a letters-only
# `[a-z]+-` silently failed both while `sk-proj-` appeared to work -- the pattern
# looked right and was tested, and still leaked.
#
# \b applies only to alternatives that START with a word character. A leading \b on
# the PEM alternative makes it unmatchable: \b needs a word character on one side,
# but '-' and a newline are both non-word, so the boundary never exists.
#
# The PEM alternative matches the BEGIN and END markers; the base64 body between them
# is handled separately by the multi-line rule in Protect-Secret, because no single
# line pattern can know it is inside a key block.
$script:SecretValuePattern = '(?:\b(?:sk-(?:[a-z0-9]+-)*[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|hf_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})|-----BEGIN [A-Z ]*PRIVATE KEY-----|-----END [A-Z ]*PRIVATE KEY-----)'

function Protect-Secret {
    <#
    .SYNOPSIS
        Redacts credential values from diagnostic output.
    .DESCRIPTION
        Runs unconditionally on every command's output. A leak-prevention guard that
        must be opted into is not a guard -- it is a rule to remember, and the whole
        point is to remove the failure mode rather than the intention.

        Two passes, because either one alone is insufficient:
          1. Name-based: any assignment whose variable name looks secretish.
          2. Prefix-based: any value matching a known credential prefix, regardless
             of the name it was assigned to.

        Only the value is masked; the variable name survives so the operator can
        still see WHICH setting is present. A bare `sk-...` outside any assignment
        is caught by pass 2.
    #>
    [CmdletBinding()]
    [OutputType([string[]])]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [AllowEmptyString()]
        [string[]] $Line
    )

    process {
        # Tracks whether we are between PEM BEGIN and END markers. A PEM body is
        # arbitrary base64 with no distinguishing prefix, so it can only be identified
        # by position -- no single-line pattern can know it is inside a key block.
        $inPemBlock = $false

        foreach ($chunk in $Line) {
            if ([string]::IsNullOrEmpty($chunk)) { $chunk; continue }

            # Split FIRST, then anchor per line. PowerShell pipes a multi-line
            # string as ONE object, and .NET anchors ^/$ to the whole string rather
            # than to each line, so an anchored pattern matches nothing on a block.
            # That bug silently disabled the entire name-based pass while the
            # unanchored value-based pass kept working, so only prefixed credentials
            # were ever caught.
            foreach ($l in ($chunk -split "`r?`n")) {
                if ($inPemBlock) {
                    # Everything inside the block is key material until the END marker.
                    if ($l -match '-----END [A-Z ]*PRIVATE KEY-----') {
                        '<REDACTED-PEM-BODY>'
                        $inPemBlock = $false
                    } else {
                        '<REDACTED-PEM-BODY>'
                    }
                    continue
                }

                if ([string]::IsNullOrEmpty($l)) { $l; continue }

                # Known placeholder values for secret-named settings. These are not credentials:
                # EMBEDDING_*_API_KEY=ollama is a dummy the local OpenAI-compatible
                # transport requires to be non-empty. Masking it hides a fact worth
                # seeing ("this endpoint needs no real key"), so the value is shown and
                # only the credential NAME is flagged.
                #
                # MUST run BEFORE pass 1: pass 1 replaces the value with <REDACTED>, so
                # by the time a placeholder rule ran afterwards the original value was
                # already gone and nothing could match. Ordering is load-bearing here.
                $out = $l -replace '(?i)^(\s*[A-Za-z0-9_.-]*(?:API_?KEY|SECRET|PASSWORD)[A-Za-z0-9_.-]*)(\s*[=:]\s*)(ollama|local|dummy|none|null|placeholder|unused)(.*)$', '$1$2$3 <not-a-secret>$4'

                # Pass 1: name-based. ^ anchors the NAME only, so the capture keeps the
                # variable visible (operator can still see WHICH setting is present)
                # while masking everything after the = or : separator.
                if ($out -notmatch '<not-a-secret>') {
                    $out = $out -replace "(?i)^(\s*(?:export\s+)?[A-Za-z0-9_.-]*(?:API_?KEY|ACCESS_?KEY|SECRET|PASSWORD|PASSWD|CREDENTIAL|PRIVATE_?KEY|AUTH_?TOKEN|ACCESS_?TOKEN|GITHUB_?TOKEN|GH_?TOKEN|API_?TOKEN)[A-Za-z0-9_.-]*)(\s*[=:]\s*)(\S+)(.*)$", '$1$2<REDACTED>$4'
                }

                # Pass 2: value-based, catches secrets hidden in an innocuous name.
                $out = $out -replace $script:SecretValuePattern, '<REDACTED>'

                # Enter PEM-body mode only if the BEGIN marker survived as a marker
                # rather than being consumed by pass 2 on the previous line.
                if ($l -match '-----BEGIN [A-Z ]*PRIVATE KEY-----') {
                    $inPemBlock = $true
                }

                $out
            }
        }
    }
}

function Invoke-RemoteCommand {
    <#
    .SYNOPSIS
        Runs a bash script on the remote host and returns its combined output.
    #>
    [CmdletBinding()]
    [OutputType([string[]])]
    param(
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [string] $BashScript
    )

    # Transport rationale, learned the hard way:
    #
    # PowerShell's pipeline appends a trailing CRLF to anything it writes to a native
    # command's stdin, and it does so during serialisation, AFTER any string-level
    # transformation. So `-replace "`r"` cannot help -- verified: the remote still saw
    # `$'line3\r'` after CR was stripped locally. It is not fixable from the payload.
    #
    # That CR then breaks heredocs: a delimiter written `PY` arrives as `PY\r`, never
    # matches, and bash reads to EOF, handing the literal terminator to the interpreter
    # as code (NameError: name 'PY' is not defined).
    #
    # Base64 sidesteps it: the encoded form is a single line with no interior newline to
    # corrupt, and the remote `tr -d '\r'` absorbs the one trailing CR PowerShell insists
    # on adding. Verified end to end against the remote host.
    $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($BashScript))

    # Protect-Secret is not optional. It is the chokepoint every diagnostic passes
    # through, so a careless grep on the remote side cannot leak a key into a
    # transcript -- which is exactly how sk-or-v1-... was exposed before.
    $encoded | & ssh @script:SshOption $script:RemoteHost "tr -d '\r' | base64 -d | bash -s" 2>&1 |
        Protect-Secret
}

function Write-SectionHeader {
    # Write-Output, not Write-Host: headers must share the success stream with the
    # ssh output, otherwise piping this script to Select-Object, Tee-Object or a log
    # file interleaves the two streams and scrambles the section order.
    param([Parameter(Mandatory)][string] $Title)

    Write-Output ''
    Write-Output "--- $Title ---"
}

# ==============================================================================
# DIAGNOSTICS
# Each function answers exactly one question about the remote host.
# ==============================================================================

function Get-ContainerStatus {
    <#
    .SYNOPSIS
        Reports the running state of the containers we depend on.
    #>
    [CmdletBinding()]
    param()

    Invoke-RemoteCommand -BashScript @'
docker ps --format '{{.Names}}   {{.Status}}' | grep -E 'honcho|gitlab'
'@
}

function Test-ServiceHealth {
    <#
    .SYNOPSIS
        Checks each service's own health endpoint.
    .DESCRIPTION
        Complements Get-ContainerStatus: a container can be "Up" while the
        application inside it has stopped serving.
    #>
    [CmdletBinding()]
    param()

    Invoke-RemoteCommand -BashScript @'
printf "   honcho api : "
curl -s -m 10 http://localhost:8000/health || echo "unreachable"
printf "\n   gitlab     : "
docker exec hexa-gitlab-19 sh -lc 'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:80/-/health' 2>/dev/null || echo "n/a"
printf "\n"
'@
}

function Get-MemorySnapshot {
    <#
    .SYNOPSIS
        Reports RAM and swap, plus load and CPU steal.
    .DESCRIPTION
        Swap is reported separately because a host with free RAM can still be paging,
        and steal is reported separately because it explains latency that the load
        average alone would attribute to real work.
    #>
    [CmdletBinding()]
    param()

    Invoke-RemoteCommand -BashScript @'
free -h
printf "   loadavg : "
cut -d' ' -f1-3 /proc/loadavg
printf "   swap io : "
vmstat 1 2 | tail -1 | awk '{printf "si=%s so=%s\n", $7, $8}'
printf "   steal   : "
vmstat 1 2 | tail -1 | awk '{print "st="$15"%"}'
'@
}

function Get-DiskUsage {
    <#
    .SYNOPSIS
        Reports filesystem usage plus the cache directories that grow unbounded here.
    #>
    [CmdletBinding()]
    param()

    Invoke-RemoteCommand -BashScript @'
df -h / | tail -1
printf "\n   reclaimable caches:\n"
for d in /root/.npm /home/hexa/.npm /root/.cache/JetBrains /root/.cache/go-build \
         /root/.cache/uv /home/hexa/.cache/uv /var/cache/apt /var/lib/apt/lists; do
  if [ -d "$d" ]; then
    printf "     %-26s %s\n" "$d" "$(du -sh "$d" 2>/dev/null | cut -f1)"
  fi
done
printf "     %-26s %s\n" "/var/log/journal" "$(du -sh /var/log/journal 2>/dev/null | cut -f1)"
printf "\n   docker:\n"
docker system df 2>/dev/null | sed 's/^/     /'
'@
}

function Get-DeriverErrorBreakdown {
    <#
    .SYNOPSIS
        Counts the failure modes in the deriver log within a time window.
    .DESCRIPTION
        Separates embedding timeouts, quota errors, and empty summaries because they
        have completely different fixes and are easy to conflate when reading raw log
        output. A single "errors are happening" number hides which one regressed.
    #>
    [CmdletBinding()]
    param(
        [ValidateRange(1, 1440)]
        [int] $WindowMinutes = 15
    )

    $script = @"
SINCE=`$(date -u -d '-$($WindowMinutes) minutes' '+%Y-%m-%dT%H:%M:%S')
LOG=/tmp/_rh_err.log

# Redirection order matters: '> log 2>&1' captures both streams into the file.
# '2>&1 > log' would send stderr to the terminal and only stdout to the file.
docker logs --since "`$SINCE" $($script:DeriverContainer) > "`$LOG" 2>&1

printf "   window: last $($WindowMinutes) min\n"
printf "   %-28s %s\n" "embedding APITimeout"       "`$(grep -c APITimeoutError "`$LOG")"
printf "   %-28s %s\n" "quota / RESOURCE_EXHAUSTED" "`$(grep -ci 'quota\|RESOURCE_EXHAUSTED' "`$LOG")"
printf "   %-28s %s\n" "gemini references"          "`$(grep -ci gemini "`$LOG")"
printf "   %-28s %s\n" "empty summary"              "`$(grep -ci 'summary is empty' "`$LOG")"

# finish_reason is the single most useful field here: 'length' means the model ran
# out of budget before emitting content, which is a TOKEN LIMIT problem and not an
# outage. Two production bugs were traced to exactly this line.
printf "   %-28s %s\n" "truncated (finish=length)"  "`$(grep -c "finish_reasons=\['length'\]" "`$LOG")"

printf "\n   recent reconciliations:\n"
grep 'Reconciliation complete' "`$LOG" | tail -3 | cut -c1-110 | sed 's/^/     /'

printf "\n   effective token budgets (a too-small budget is the usual root cause):\n"
docker exec honcho-deriver-1 python -c \
  "from src.config import settings; from src.deriver.deriver import _get_deriver_model_config as g; c=g(); print('     deriver max_tokens   =', c.max_output_tokens or settings.LLM.DEFAULT_MAX_TOKENS); print('     summary MAX_TOK_SHORT=', settings.SUMMARY.MAX_TOKENS_SHORT)" 2>/dev/null | sed 's/^/  /'
rm -f "`$LOG"
"@
    Invoke-RemoteCommand -BashScript $script
}

function Test-EmbeddingPath {
    <#
    .SYNOPSIS
        Makes a real embedding call and reports dimensionality.
    .DESCRIPTION
        This is the check that matters. The Honcho health endpoint does not touch the
        embedding provider, so it stays green while every write is failing.
    #>
    [CmdletBinding()]
    param()

    $script = @"
RESP=`$(curl -s -m $($script:ModelProbeTimeoutSeconds) \
  $($script:OllamaApiUrl)/embeddings \
  -d '{"model":"$($script:EmbeddingModel)","prompt":"diagnostic probe"}')

python3 - "`$RESP" <<'PY'
import json, sys

try:
    dims = len(json.loads(sys.argv[1]).get("embedding", []))
    print("   dims = %d   (expected 768)" % dims)
except Exception as exc:
    print("   embedder FAILED: %s" % exc)
PY
"@
    Invoke-RemoteCommand -BashScript $script
}

function Test-LlmPath {
    <#
    .SYNOPSIS
        Makes a real chat completion call and reports content and latency.
    .DESCRIPTION
        Reports reasoning_content separately from content. This model routes a
        large share of its token budget to reasoning, so a small max_tokens yields
        content=None and looks like a broken model when the request was merely
        truncated.
    #>
    [CmdletBinding()]
    param()

    $script = @"
# Read the key from the running container rather than parsing .env, so the value is
# the one Honcho actually resolved and duplicate .env blocks cannot mislead us.
KEY=`$(docker exec $($script:ApiContainer) printenv DERIVER_MODEL_CONFIG__OVERRIDES__API_KEY 2>/dev/null)
START=`$(date +%s%N)

RESP=`$(curl -s -m $($script:ModelProbeTimeoutSeconds) $($script:OpenRouterBaseUrl)/chat/completions \
  -H "Authorization: Bearer `$KEY" \
  -H 'Content-Type: application/json' \
  -d '{"model":"$($script:LlmModel)","messages":[{"role":"user","content":"Reply with the single word: pong"}],"max_tokens":2000}')

python3 - "`$RESP" <<'PY'
import json, sys

try:
    data = json.loads(sys.argv[1])
    if "error" in data:
        print("   llm ERROR:", str(data["error"])[:70])
    else:
        msg = data["choices"][0]["message"]
        content = msg.get("content")
        reasoning = msg.get("reasoning_content") or ""
        print("   content  :", repr(content)[:50] if content else "EMPTY")
        if reasoning:
            print("   reasoning:", repr(reasoning)[:50])
except Exception as exc:
    print("   llm FAILED: %s" % exc)
PY

END=`$(date +%s%N)
printf "   latency : %d ms\n" `$(( (END - START) / 1000000 ))
"@
    Invoke-RemoteCommand -BashScript $script
}

function Get-ResolvedModelConfig {
    <#
    .SYNOPSIS
        Shows the model configuration Honcho actually resolved.
    .DESCRIPTION
        Deliberately does not read the .env file. With duplicate keys, the last
        definition wins, so reading the file reports the wrong value; asking the
        running application reports the right one.
    #>
    [CmdletBinding()]
    param()

    $script = @"
docker exec -i -e PYTHONPATH=/app $($script:ApiContainer) python - <<'PY'
from src.config import EmbeddingSettings, DeriverSettings

embed = EmbeddingSettings().MODEL_CONFIG
print("   EMBEDDING transport :", embed.transport)
print("   EMBEDDING model     :", embed.model)
print("   EMBEDDING base_url  :", embed.overrides.base_url)

deriver = DeriverSettings().MODEL_CONFIG
print("   DERIVER  transport  :", deriver.transport)
print("   DERIVER  model      :", deriver.model)
print("   DERIVER  effort     :", getattr(deriver, "thinking_effort", None))
fallback = getattr(deriver, "fallback", None)
print("   DERIVER  fallback   :", (fallback.transport + " / " + fallback.model) if fallback else None)
PY
"@
    Invoke-RemoteCommand -BashScript $script
}

function Backup-HonchoEnv {
    <#
    .SYNOPSIS
        Takes a timestamped copy of the Honcho .env before any edit.
    #>
    [CmdletBinding()]
    param()

    $script = @"
cp -a $($script:HonchoEnvFile) "$($script:HonchoEnvFile).bak.`$(date +%Y%m%d-%H%M%S)"
ls -1t $($script:HonchoEnvFile).bak.* 2>/dev/null | head -3
"@
    Invoke-RemoteCommand -BashScript $script
}

# ==============================================================================
# MUTATING OPERATIONS
# Kept separate from the diagnostics above and never reachable from Show-HealthReport.
# Each takes -Confirm semantics via the shared Confirm-Destructive guard, because a
# diagnostics script that can silently delete 42 GB is one refactor away from
# destroying the wrong thing.
# ==============================================================================

function Confirm-Destructive {
    <#
    .SYNOPSIS
        Gate for any operation that changes remote state.
    .DESCRIPTION
        Defaults to refusing unless -Force is passed. These verbs delete caches, drop
        swap and restart containers; the blast radius is large enough that an
        accidental invocation should fail closed rather than ask forgiveness.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string] $Operation,

        [switch] $Force
    )

    if ($Force) { return }

    Write-Warning "REFUSING to $Operation without -Force."
    Write-Warning 'This changes remote state. Re-run with -Force if that is intended.'
    return $false
}

function Clear-ReclaimableCache {
    <#
    .SYNOPSIS
        Deletes the package/tool caches that grow unbounded on this host.
    .DESCRIPTION
        Only touches paths that are regenerated on demand. Deliberately does NOT
        touch: /root/.lmstudio/models (15 GB of downloaded models), Docker volumes,
        or any GitLab data path. Those are large and expensive to re-fetch.
    #>
    [CmdletBinding()]
    param([switch] $Force)

    if (-not (Confirm-Destructive -Operation 'delete caches' -Force:$Force)) { return }

    $script = @"
set -e
BEFORE=`$(df -h / | tail -1 | awk '{print `$4}')

# Regenerable caches only. Models, Docker volumes and GitLab data are excluded.
for d in /root/.npm /home/hexa/.npm /root/.cache/JetBrains /root/.cache/go-build \
         /root/.cache/uv /home/hexa/.cache/uv /var/cache/apt /var/lib/apt/lists; do
  if [ -d "`$d" ]; then
    printf '  freeing %s (%s)\n' "`$d" "`$(du -sh "`$d" 2>/dev/null | cut -f1)"
    rm -rf "`$d"/* 2>/dev/null || true
  fi
done

docker image prune -f >/dev/null 2>&1 || true
journalctl --vacuum-time=7d >/dev/null 2>&1 || true

AFTER=`$(df -h / | tail -1 | awk '{print `$4}')
echo
echo "  free before: `$BEFORE"
echo "  free after : `$AFTER"
"@
    Invoke-RemoteCommand -BashScript $script
}

function Reset-Swap {
    <#
    .SYNOPSIS
        Cycles swap off and back on to clear stale pages.
    .DESCRIPTION
        swapoff fails if it cannot reserve enough RAM to hold the swapped pages, which
        is the correct behaviour: the script reports it rather than forcing it and
        risking an OOM kill.
    #>
    [CmdletBinding()]
    param([switch] $Force)

    if (-not (Confirm-Destructive -Operation 'reset swap' -Force:$Force)) { return }

    Invoke-RemoteCommand -BashScript @'
free -h | sed -n '1,3p'
echo "  --- swapoff ---"
if swapoff -a 2>&1; then
  swapon -a 2>&1
  echo "  swap reset OK"
else
  echo "  swapoff FAILED -- not enough free RAM to hold swapped pages (correctly refused)"
fi
free -h | sed -n '1,3p'
'@
}

function Test-OllamaFirewall {
    <#
    .SYNOPSIS
        Ensures the Docker bridge can reach the host-side Ollama listener, then proves it.
    .DESCRIPTION
        The scope matters: 172.16.0.0/12 is Docker's bridge range, so this does NOT
        expose Ollama to the internet. An earlier symptom was ufw's routed-traffic
        default dropping container -> host traffic, which left /health green while
        every embedding call timed out.
    #>
    [CmdletBinding()]
    param([switch] $Force)

    if (-not (Confirm-Destructive -Operation 'insert ufw rules' -Force:$Force)) { return }

    $script = @"
set -e
echo "  --- insert rules (scoped to docker bridge 172.16.0.0/12, NOT the internet) ---"
ufw insert 1 allow from 172.16.0.0/12 to any port 11434 proto tcp comment 'honcho -> local ollama embeddings' 2>&1 | sed 's/^/    /' || true
ufw insert 1 allow out to 172.16.0.0/12 port 11434 proto tcp comment 'honcho -> local ollama embeddings (out)' 2>&1 | sed 's/^/    /' || true

echo
echo "  --- rules touching 11434 ---"
ufw status numbered 2>/dev/null | grep -E "11434|Status" | sed 's/^/    /'

echo
echo "  --- reachability from a container on the honcho network ---"
docker run --rm --network honcho_default alpine:latest sh -c \
  "(nc -z -w6 $($script:DockerBridgeGateway) 11434 && echo '    container -> ollama:11434 = OK') || echo '    container -> ollama:11434 = BLOCKED'" 2>&1 | tail -2
"@
    Invoke-RemoteCommand -BashScript $script
}

function Show-HealthReport {
    <#
    .SYNOPSIS
        Runs the full sweep by composing the single-question diagnostics above.
    #>
    [CmdletBinding()]
    param()

    Write-SectionHeader 'containers'
    Get-ContainerStatus

    Write-SectionHeader 'service health'
    Test-ServiceHealth

    Write-SectionHeader 'memory'
    Get-MemorySnapshot

    Write-SectionHeader 'embedding path'
    Test-EmbeddingPath

    Write-SectionHeader 'llm path'
    Test-LlmPath

    Write-SectionHeader 'resolved config'
    Get-ResolvedModelConfig

    Write-SectionHeader "deriver errors (last $WindowMinutes min)"
    Get-DeriverErrorBreakdown -WindowMinutes $WindowMinutes
}

# ==============================================================================
# ENTRY POINT
# Guarded so dot-sourcing for function access does not trigger a remote run.
# param() must stay at script scope; only the dispatch is conditional.
# ==============================================================================

if ($MyInvocation.InvocationName -ne '.') {
    # Mutating verbs are listed separately and never included in `report`, so a full
    # sweep cannot delete caches, drop swap or touch the firewall by accident. Each
    # one also refuses without -Force (see Confirm-Destructive).
    $dispatch = @{
        # --- read-only ---
        'report'     = { Show-HealthReport }
        'health'     = { Test-ServiceHealth }
        'containers' = { Get-ContainerStatus }
        'memory'     = { Get-MemorySnapshot }
        'disk'       = { Get-DiskUsage }
        'errors'     = { Get-DeriverErrorBreakdown -WindowMinutes $WindowMinutes }
        'embedding'  = { Test-EmbeddingPath }
        'llm'        = { Test-LlmPath }
        'config'     = { Get-ResolvedModelConfig }

        # --- mutating: require -Force ---
        'backup'     = { Backup-HonchoEnv }
        'clean'      = { Clear-ReclaimableCache -Force:$Force }
        'swap'       = { Reset-Swap -Force:$Force }
        'firewall'   = { Test-OllamaFirewall -Force:$Force }
    }

    & $dispatch[$Verb]
}