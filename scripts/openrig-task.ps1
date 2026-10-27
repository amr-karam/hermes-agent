# OpenOpenRig WSL2 fleet task registration — PowerShell entry point.
#
# Registers `openrig-up.sh` as a Windows Scheduled Task so the WSL2 fleet
# restores its seats on boot / at a configured interval without manual
# intervention. Designed to be idempotent: re-running replaces the existing
# task definition rather than creating duplicates.
#
# Requires elevation (Administrator). Task Scheduler stores the task under
# \OpenOpenRig so it can be found/enabled/disabled via Task Scheduler MMC or
# `schtasks /query /tn "\OpenOpenRig\FleetRestore"`.
#
# Examples:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\openrig-task.ps1 -Register
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\openrig-task.ps1 -Register -Once -Interval 00:15:00
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\openrig-task.ps1 -Unregister
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\openrig-task.ps1 -Status

[CmdletBinding(PositionalBinding = $false)]
param(
    [switch]$Register,
    [switch]$Unregister,
    [switch]$Status,
    [switch]$Once,
    [string]$Interval = "00:15:00",
    [string]$TaskName = "OpenOpenRigFleetRestore",
    [string]$TaskPath = "\OpenOpenRig",
    [string]$OpenrigUpScript = "",
    [string]$User = "SYSTEM",
    [switch]$HighestPrivilege
)

$ErrorActionPreference = "Stop"

# --- Preconditions ----------------------------------------------------------

function Test-Elevated {
    $id = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $pr  = New-Object System.Security.Principal.WindowsPrincipal($id)
    return $pr.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Elevated)) {
    Write-Error "openrig-task.ps1 requires Administrator elevation. Run from an elevated PowerShell prompt:"
    Write-Host "  powershell -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath -Register" -ForegroundColor Yellow
    exit 3
}

# Resolve the openrig-up.sh target (must exist before we can register it).
if (-not $OpenrigUpScript) { $OpenrigUpScript = Join-Path $PSScriptRoot "..\..\openrig-up.sh" }
$OpenrigUpScript = (Resolve-Path -LiteralPath $OpenrigUpScript -ErrorAction Stop).Path
$OpenrigUpDir    = Split-Path -Parent $OpenrigUpScript

function New-OpenrigTaskAction {
    # WSL path for the scheduled task action. wsl.exe must be on PATH.
    $wsl = Get-Command wsl -ErrorAction SilentlyContinue
    if (-not $wsl) { Write-Error "wsl.exe not found on PATH — install WSL and ensure wsl.exe is available."; exit 4 }

    $relative = Resolve-Path -LiteralPath $OpenrigUpScript -Relative
    # `openrig-up.sh` lives at repo root; pass it as a WSL path so WSL resolves it.
    $wslPath = "$relative"
    if ($wslPath -notmatch "^/") { $wslPath = "/$wslPath" }
    $wslPath = $wslPath.Replace("\", "/")

    New-ScheduledTaskAction -Execute "wsl.exe" -Argument "bash -lc 'cd /mnt/c/Users/amrmo/workspace/hermes-agent && bash openrig-up.sh'" -WorkingDirectory $OpenrigUpDir
}

function New-OpenrigTaskTrigger {
    if ($Once) {
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1)
        $trigger.Repetition.Interval = [System.TimeSpan]::Parse($Interval)
        $trigger.Repetition.Duration = [System.TimeSpan]::FromDays(365)
        $trigger
    } else {
        # Default: daily at 03:00, repeat every $Interval for 24h.
        New-ScheduledTaskTrigger -Daily -At "3:00 AM" -RepetitionInterval ([System.TimeSpan]::Parse($Interval)) -RepetitionDuration ([System.TimeSpan]::FromDays(1))
    }
}

function New-OpenrigTaskSettings {
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -WakeToRun:$false `
        -ExecutionTimeLimit ([System.TimeSpan]::FromHours(2))
    $settings
}

function Register-OpenrigTask {
    $action  = New-OpenrigTaskAction
    $trigger = New-OpenrigTaskTrigger
    $settings = New-OpenrigTaskSettings
    $principal = New-ScheduledTaskPrincipal -UserId $User -LogonType ServiceAccount -RunLevel Highest

    $fullPath = Join-Path $TaskPath $TaskName
    if (Test-Path -LiteralPath (Join-Path $TaskPath $TaskName) -ErrorAction SilentlyContinue) {
        # Idempotent: unregister the existing definition first so we replace it cleanly.
        Unregister-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -Confirm:$false -ErrorAction SilentlyContinue
    }

    Register-ScheduledTask `
        -TaskName $TaskName `
        -TaskPath $TaskPath `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Force

    Write-Host "Registered scheduled task: $fullPath" -ForegroundColor Green
    Write-Host "  Action: wsl.exe bash openrig-up.sh" -ForegroundColor Gray
    Write-Host "  Trigger: $(if ($Once) { "Once + repeat every $Interval" } else { "Daily + repeat every $Interval" })" -ForegroundColor Gray
}

function Unregister-OpenrigTask {
    $fullPath = Join-Path $TaskPath $TaskName
    $exists = Get-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -ErrorAction SilentlyContinue
    if ($exists) {
        Unregister-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -Confirm:$false
        Write-Host "Unregistered scheduled task: $fullPath" -ForegroundColor Green
    } else {
        Write-Host "No scheduled task found at $fullPath — nothing to unregister." -ForegroundColor Yellow
    }
}

function Show-OpenrigStatus {
    $fullPath = Join-Path $TaskPath $TaskName
    $task = Get-ScheduledTask -TaskName $TaskName -TaskPath $TaskPath -ErrorAction SilentlyContinue
    if (-not $task) {
        Write-Host "No scheduled task found at $fullPath." -ForegroundColor Yellow
        return
    }
    $state = Get-ScheduledTaskInfo -TaskName $TaskName -TaskPath $TaskPath -ErrorAction SilentlyContinue
    Write-Host "Scheduled task: $fullPath" -ForegroundColor Green
    Write-Host "  State: $($task.State)" -ForegroundColor Gray
    Write-Host "  LastRunTime: $($state.LastRunTime)" -ForegroundColor Gray
    Write-Host "  LastTaskResult: $($state.LastTaskResult)" -ForegroundColor Gray
    Write-Host "  NextRunTime: $($state.NextRunTime)" -ForegroundColor Gray
    $task.Triggers | ForEach-Object { Write-Host "  Trigger: $($_.TriggerType) enabled=$($_.Enabled)" -ForegroundColor Gray }
}

# --- Dispatch ---------------------------------------------------------------

$modeCount = @($Register, $Unregister, $Status).Where({ $_ }).Count
if ($modeCount -eq 0) {
    Write-Error "Specify one of -Register, -Unregister, or -Status."
    exit 2
}
if ($modeCount -gt 1) {
    Write-Error "Specify only one of -Register, -Unregister, or -Status."
    exit 2
}

if ($Register) { Register-OpenrigTask }
elseif ($Unregister) { Unregister-OpenrigTask }
elseif ($Status) { Show-OpenrigStatus }

exit 0
