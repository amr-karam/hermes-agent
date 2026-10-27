# OpenRig remote fleet task registration — PowerShell entry point.
#
# Registers an SSH-based Windows Scheduled Task that triggers OpenRig fleet
# seat restore on the remote host (19.16.1.100) at a configured interval
# without manual intervention. Designed to be idempotent: re-running replaces
# the existing task definition rather than creating duplicates.
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
    [string]$OpenrigHost = "19.16.1.100",
    [string]$OpenrigUser = "root",
    [string]$OpenrigCommand = "bash -lc 'cd /opt/openrig && bash openrig-up.sh'",
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

# Remote OpenRig host is the restore target; no local script required.

function New-OpenrigTaskAction {
    # SSH action for the scheduled task. ssh.exe (OpenSSH client) must be on PATH.
    $ssh = Get-Command ssh -ErrorAction SilentlyContinue
    if (-not $ssh) { Write-Error "ssh.exe not found on PATH — install OpenSSH Client and ensure ssh.exe is available."; exit 4 }

    New-ScheduledTaskAction -Execute "ssh.exe" -Argument "$OpenrigUser@$OpenrigHost $OpenrigCommand" -WorkingDirectory $null
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
    Write-Host "  Action: ssh.exe $OpenrigUser@$OpenrigHost $OpenrigCommand" -ForegroundColor Gray
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
