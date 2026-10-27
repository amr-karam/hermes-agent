#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Closes the LAN-wide exposure of the Hermes API server (TCP 8642) while
    preserving the two access paths that are actually in use.

.DESCRIPTION
    Windows auto-creates blanket inbound ALLOW rules for a binary the first time
    it is seen listening ("let this app communicate on all networks"). For
    hermes.exe / hermescompanion.exe those rules are:

        Direction=In  LocalPort=Any  RemoteIP=Any  Protocol=TCP/UDP  Action=Allow
        Profiles=Private,Public

    A blanket allow beats the narrower "Hermes API Server (Paperclip only)" rule,
    so TCP 8642 is reachable from every host on the LAN even though it appears
    to be scoped. Hermes itself flags this at startup:

        [Api_Server] API server is network-accessible (19.16.1.10) AND the
        terminal backend is 'local' (unsandboxed).

    This script DISABLES (does not delete) the blanket rules and adds an explicit
    allow for the Tailscale range, so 8642 stays reachable from:
      - Tailscale peers        100.64.0.0/10
      - the Paperclip host     19.16.1.100/32   (rule already exists, kept)
      - loopback               127.0.0.1        (implicit, never filtered)

    Everything else on the LAN loses access to 8642.

    Idempotent: safe to re-run. Rollback is at the bottom of this file.

.NOTES
    OpenRig's daemon on TCP 7433 is a node.exe process and is NOT affected by
    these rules.
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    # Keep inbound TCP 8642 reachable from this range (default: Tailscale CGNAT).
    [string]$TailscaleCidr = '100.64.0.0/10',

    # Port the Hermes API server listens on.
    [int]$Port = 8642
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    [ok]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    [warn] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "    [err]  $msg" -ForegroundColor Red }

# Verify elevation before touching anything.
$id = [Security.Principal.WindowsIdentity]::GetCurrent()
$isAdmin = (New-Object Security.Principal.WindowsPrincipal($id)).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Err 'Must be run from an ELEVATED PowerShell prompt.'
    Write-Host '    Right-click PowerShell -> Run as administrator, then:' -ForegroundColor Yellow
    Write-Host '    powershell -NoProfile -ExecutionPolicy Bypass -File .\fix-api-server-exposure.ps1'
    exit 1
}

Write-Step 'Snapshotting current firewall state to %TEMP%\hermes-fw-before.txt'
$snapshot = "$env:TEMP\hermes-fw-before.txt"
try {
    Get-NetFirewallRule -Direction Inbound -ErrorAction Stop |
        Where-Object { $_.DisplayName -match 'hermes' } |
        ForEach-Object {
            $pf = $_ | Get-NetFirewallPortFilter -ErrorAction SilentlyContinue
            [PSCustomObject]@{
                Name        = $_.DisplayName
                Enabled     = $_.Enabled
                Action      = $_.Action
                Profiles    = $_.Profile
                Protocol    = $pf.Protocol
                LocalPort   = $pf.LocalPort
                RemoteIP    = ($_ | Get-NetFirewallAddressFilter -ErrorAction SilentlyContinue).RemoteAddress
            }
        } | Format-Table -AutoSize | Out-String -Width 200 | Set-Content -LiteralPath $snapshot -Encoding UTF8
    Write-Ok "snapshot written: $snapshot"
} catch {
    Write-Warn "snapshot failed: $($_.Exception.Message)"
}

# ---------------------------------------------------------------------------
# 1. Disable the blanket allow-all-inbound rules
# ---------------------------------------------------------------------------
Write-Step 'Disabling blanket inbound ALLOW rules (LocalPort=Any AND RemoteIP=Any)'

# Identify candidates precisely: allow + inbound + both Any. Narrow rules
# (e.g. the Paperclip one, or the ones we add below) are never matched.
$candidates = @()
foreach ($rule in (Get-NetFirewallRule -Direction Inbound -Action Allow -ErrorAction SilentlyContinue)) {
    if ($rule.DisplayName -notmatch '^(hermes|hermescompanion)') { continue }
    $pf = $rule | Get-NetFirewallPortFilter -ErrorAction SilentlyContinue
    $af = $rule | Get-NetFirewallAddressFilter -ErrorAction SilentlyContinue
    if ($pf.LocalPort -eq 'Any' -and $af.RemoteAddress -eq 'Any') {
        $candidates += [PSCustomObject]@{
            DisplayName = $rule.DisplayName
            InternalName = $rule.Name
            Protocol    = $pf.Protocol
            Rule        = $rule
        }
    }
}

if (-not $candidates) { Write-Ok 'no blanket rules found (already clean)' }
else {
    # NOTE: these rules' internal -Name is a long
    #   "TCP Query User{GUID}<path>" string, NOT the DisplayName. Passing the
    #   DisplayName to -Name silently matches nothing. Pipe the rule OBJECT
    #   instead, and verify each one actually flipped - never claim success
    #   without re-reading state.
    $failed = 0
    foreach ($c in $candidates) {
        if (-not $PSCmdlet.ShouldProcess($c.DisplayName, 'Disable blanket inbound allow rule')) { continue }
        try {
            $c.Rule | Disable-NetFirewallRule -ErrorAction Stop
            # Confirm the flip actually took. Must be a FRESH service query by the
            # unique internal name - piping the cached rule object back through
            # Get-NetFirewallRule returns the stale pre-disable value and reports a
            # false failure.
            $now = Get-NetFirewallRule -Name $c.InternalName -ErrorAction SilentlyContinue
            if ($now -and $now.Enabled -eq 'False') {
                Write-Ok "disabled: $($c.DisplayName) ($($c.Protocol))"
            } else {
                Write-Err "STILL ENABLED after disable: $($c.DisplayName) ($($c.Protocol))"
                $failed++
            }
        } catch {
            Write-Err "failed to disable $($c.DisplayName) ($($c.Protocol)): $($_.Exception.Message)"
            $failed++
        }
    }
    if ($failed) {
        Write-Err "$failed blanket rule(s) could not be disabled - aborting before any further change."
        exit 3
    }
    Write-Ok ("disabled {0} blanket rule(s), all verified" -f $candidates.Count)
}

# ---------------------------------------------------------------------------
# 2. Explicitly allow the Tailscale range to reach the API server
# ---------------------------------------------------------------------------
Write-Step "Ensuring an ALLOW rule for TCP $Port from $TailscaleCidr"
$ruleName = "Hermes API Server (Tailscale only)"

$existing = Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue
if ($existing) {
    # Idempotent: only mutate when the rule does not already match the target
    # state. Re-setting a matching rule is what made re-runs abort.
    $pfx = $existing | Get-NetFirewallPortFilter -ErrorAction SilentlyContinue
    $afx = $existing | Get-NetFirewallAddressFilter -ErrorAction SilentlyContinue
    $matches = ($existing.Enabled -eq 'True') -and ($existing.Action -eq 'Allow') `
              -and ("$($pfx.Protocol)" -eq 'TCP') -and ("$($pfx.LocalPort)" -eq "$Port") `
              -and ("$($afx.RemoteAddress)" -match "^$([regex]::Escape($TailscaleCidr))")
    if ($matches) {
        Write-Ok "rule '$ruleName' already correct (TCP $Port from $TailscaleCidr) - left untouched"
    } elseif ($PSCmdlet.ShouldProcess($ruleName, 'Update')) {
        try {
            Set-NetFirewallRule -Name $ruleName -Enabled True -Action Allow -ErrorAction Stop
            # The filter cmdlets have NO -Name parameter (only -InputObject / pipeline).
            # Pipe the filter object out of the rule instead.
            $existing | Get-NetFirewallPortFilter -ErrorAction Stop |
                Set-NetFirewallPortFilter -Protocol TCP -LocalPort $Port -ErrorAction Stop
            $existing | Get-NetFirewallAddressFilter -ErrorAction Stop |
                Set-NetFirewallAddressFilter -RemoteAddress $TailscaleCidr -ErrorAction Stop
            Write-Ok "updated: $ruleName"
        } catch {
            # Never let a re-run's cosmetic re-set abort an already-correct setup.
            Write-Warn "could not update '$ruleName': $($_.Exception.Message)"
            Write-Warn 'the existing rule is left in place - verify it manually'
        }
    }
} else {
    if ($PSCmdlet.ShouldProcess($ruleName, 'Create')) {
        New-NetFirewallRule -Name $ruleName `
            -DisplayName 'Hermes API Server (Tailscale only)' `
            -Description "Allow TCP $Port from Tailscale peers only" `
            -Direction Inbound -Action Allow -Protocol TCP `
            -LocalPort $Port -RemoteAddress $TailscaleCidr `
            -Profile Any -Enabled True | Out-Null
        Write-Ok "created: $ruleName"
    }
}

# ---------------------------------------------------------------------------
# 3. Verification
# ---------------------------------------------------------------------------
Write-Step 'Verifying'
Start-Sleep -Milliseconds 300
$final = Get-NetFirewallRule -Direction Inbound -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -match 'hermes' } |
    ForEach-Object {
        $pf = $_ | Get-NetFirewallPortFilter -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            Name      = $_.DisplayName
            Enabled   = $_.Enabled
            Action    = $_.Action
            Protocol  = $pf.Protocol
            LocalPort = $pf.LocalPort
            RemoteIP  = ($_ | Get-NetFirewallAddressFilter -ErrorAction SilentlyContinue).RemoteAddress
        }
    }
$final | Format-Table -AutoSize | Out-String -Width 200 | Write-Host

$stillBlanket = $final | Where-Object {
    $_.Enabled -eq 'True' -and $_.LocalPort -eq 'Any' -and $_.RemoteIP -eq 'Any'
}
if ($stillBlanket) {
    Write-Warn 'blanket rules still enabled - review the table above'
    exit 2
}

Write-Host ''
Write-Host 'Done. TCP 8642 now accepts connections from loopback, Tailscale peers,' -ForegroundColor Green
Write-Host 'and 19.16.1.100 (Paperclip) only.' -ForegroundColor Green
Write-Host ''
Write-Host 'Restart the Hermes gateway for it to re-bind and re-log its posture:' -ForegroundColor Cyan
Write-Host '    hermes gateway restart' -ForegroundColor Cyan
Write-Host ''
Write-Host 'ROLLBACK (restores the blanket rules):' -ForegroundColor DarkGray
Write-Host '    Get-NetFirewallRule -Direction Inbound | Where-Object { $_.DisplayName -match ''^(hermes|hermescompanion)'' } | Enable-NetFirewallRule' -ForegroundColor DarkGray

# ---------------------------------------------------------------------------
# ROLLBACK
# ---------------------------------------------------------------------------
# Re-enable every blanket rule and drop the Tailscale-scoped one:
#
#   Get-NetFirewallRule -Direction Inbound -ErrorAction SilentlyContinue |
#     Where-Object { $_.DisplayName -match '^(hermes|hermescompanion)' } |
#     Enable-NetFirewallRule
#   Remove-NetFirewallRule -Name "Hermes API Server (Tailscale only)" -ErrorAction SilentlyContinue
#
# Original pre-change state: $snapshot
