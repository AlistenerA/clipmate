#Requires -Version 5.1

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet("pro", "lifetime")]
    [string]$Plan = "pro",

    [Parameter()]
    [ValidateRange(1, 20)]
    [int]$Devices = 1,

    [Parameter()]
    [ValidateRange(1, 3650)]
    [Nullable[int]]$Days,

    [Parameter()]
    [AllowEmptyString()]
    [string]$Remark = "",

    [Parameter()]
    [ValidatePattern("^[A-Za-z0-9._-]+(?:@[A-Za-z0-9._-]+)?$")]
    [string]$SshTarget = "codexconnected",

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$OutputDirectory = (Join-Path $env:USERPROFILE "Documents\ClipMate-Licenses"),

    [Parameter()]
    [switch]$PassThru
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$licensePattern = "[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}(?:-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}){3}"

function Protect-LicenseFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    if ($null -eq $identity.User) {
        throw "Cannot determine the current Windows user SID."
    }

    $icacls = Get-Command "icacls.exe" -ErrorAction Stop
    $userGrant = "*{0}:(F)" -f $identity.User.Value
    $systemGrant = "*S-1-5-18:(F)"
    $aclOutput = & $icacls.Source $Path "/inheritance:r" "/grant:r" $userGrant $systemGrant 2>&1
    $aclExitCode = $LASTEXITCODE
    if ($aclExitCode -ne 0) {
        $detail = ($aclOutput | ForEach-Object { $_.ToString() }) -join [Environment]::NewLine
        throw "Failed to restrict the output file ACL. icacls exit code: $aclExitCode. $detail"
    }
}

function Get-RemoteValue {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $pattern = "^{0}:\s*(.+?)\s*$" -f [regex]::Escape($Name)
    $values = @()
    foreach ($line in $Lines) {
        $match = [regex]::Match($line, $pattern)
        if ($match.Success) {
            $values += $match.Groups[1].Value
        }
    }

    if ($values.Count -ne 1) {
        throw "Remote output did not contain exactly one '$Name' field."
    }
    return $values[0]
}

function Invoke-RemoteBash {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SshPath,

        [Parameter(Mandatory = $true)]
        [string]$Target,

        [Parameter(Mandatory = $true)]
        [string]$Script
    )

    $encoding = [System.Text.UTF8Encoding]::new($false)
    $payload = [Convert]::ToBase64String($encoding.GetBytes($Script))
    $command = "printf '%s' '$payload' | base64 --decode | /bin/bash"
    $arguments = @(
        "-o", "BatchMode=yes",
        "-o", "ConnectTimeout=15",
        "-o", "StrictHostKeyChecking=accept-new",
        $Target,
        $command
    )

    $rawOutput = & $SshPath @arguments 2>&1
    $exitCode = $LASTEXITCODE
    $lines = @($rawOutput | ForEach-Object { $_.ToString().TrimEnd("`r", "`n") })
    return [pscustomobject]@{
        ExitCode = $exitCode
        Lines = $lines
    }
}

if ($Remark.Length -gt 200) {
    throw "Remark must be 200 characters or fewer."
}

$effectiveDays = $null
if ($Plan -eq "pro") {
    $effectiveDays = if ($PSBoundParameters.ContainsKey("Days")) { [int]$Days } else { 30 }
}
elseif ($PSBoundParameters.ContainsKey("Days")) {
    throw "Lifetime licenses must not set -Days."
}

$ssh = Get-Command "ssh.exe" -ErrorAction Stop
$utf8 = [System.Text.UTF8Encoding]::new($false)
$remarkBase64 = [Convert]::ToBase64String($utf8.GetBytes($Remark))
$daysArgument = if ($null -ne $effectiveDays) { " --days $effectiveDays" } else { "" }

$remoteTemplate = @'
set -eu
cd /opt/license-server/current
set -a
. /etc/license-server/license-server.env
set +a
remark="$(printf '%s' '__REMARK_BASE64__' | base64 --decode)"
umask 077
exec /opt/license-server/venv/bin/python generate_key.py create --plan __PLAN__ --devices __DEVICES____DAYS_ARGUMENT__ --remark "$remark"
'@

$remoteScript = $remoteTemplate.Replace("__REMARK_BASE64__", $remarkBase64)
$remoteScript = $remoteScript.Replace("__PLAN__", $Plan)
$remoteScript = $remoteScript.Replace("__DEVICES__", $Devices.ToString([Globalization.CultureInfo]::InvariantCulture))
$remoteScript = $remoteScript.Replace("__DAYS_ARGUMENT__", $daysArgument)
$remoteResult = Invoke-RemoteBash -SshPath $ssh.Source -Target $SshTarget -Script $remoteScript
$outputLines = $remoteResult.Lines

if ($remoteResult.ExitCode -ne 0) {
    $safeDetail = ($outputLines -join [Environment]::NewLine) -replace $licensePattern, "****-****-****-****"
    throw "Remote license creation failed (ssh exit code $($remoteResult.ExitCode)). $safeDetail"
}

$keyValues = @()
foreach ($line in $outputLines) {
    $match = [regex]::Match($line, "^Key:\s*($licensePattern)\s*$")
    if ($match.Success) {
        $keyValues += $match.Groups[1].Value
    }
}
if ($keyValues.Count -ne 1) {
    throw "Remote output did not contain exactly one valid License Key."
}

$licenseKey = $keyValues[0]
$outputPath = $null
try {
    $remotePlan = Get-RemoteValue -Lines $outputLines -Name "Plan"
    $remoteDevices = Get-RemoteValue -Lines $outputLines -Name "Devices"
    $remoteExpires = Get-RemoteValue -Lines $outputLines -Name "Expires"

    if ($remotePlan -ne $Plan -or $remoteDevices -ne $Devices.ToString([Globalization.CultureInfo]::InvariantCulture)) {
        throw "Remote output did not match the requested plan or device count."
    }

    $fullOutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
    [System.IO.Directory]::CreateDirectory($fullOutputDirectory) | Out-Null
    $timestamp = [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssZ", [Globalization.CultureInfo]::InvariantCulture)
    $suffix = [Guid]::NewGuid().ToString("N").Substring(0, 8)
    $outputPath = Join-Path $fullOutputDirectory "clipmate-$Plan-$timestamp-$suffix.txt"

    [System.IO.File]::WriteAllText($outputPath, "", [System.Text.Encoding]::ASCII)
    Protect-LicenseFile -Path $outputPath
    [System.IO.File]::WriteAllText($outputPath, $licenseKey, [System.Text.Encoding]::ASCII)
}
catch {
    $localFailure = $_
    if ($null -ne $outputPath -and (Test-Path -LiteralPath $outputPath)) {
        Remove-Item -LiteralPath $outputPath -Force -ErrorAction SilentlyContinue
    }

    $revokeScript = @"
set -eu
cd /opt/license-server/current
set -a
. /etc/license-server/license-server.env
set +a
exec /opt/license-server/venv/bin/python generate_key.py revoke '$licenseKey'
"@
    $revokeResult = Invoke-RemoteBash -SshPath $ssh.Source -Target $SshTarget -Script $revokeScript
    if ($revokeResult.ExitCode -ne 0 -or ($revokeResult.Lines -join "`n") -notmatch "License revoked") {
        throw "Windows key delivery failed and automatic remote revoke also failed. Locate the newest key by its remark and revoke it manually. Original error: $($localFailure.Exception.Message)"
    }
    throw "Windows key delivery failed; the generated remote key was automatically revoked. Original error: $($localFailure.Exception.Message)"
}

$maskedKey = "****-****-****-{0}" -f $licenseKey.Substring($licenseKey.Length - 4)
Write-Host "License created: $maskedKey"
Write-Host "Saved to: $outputPath"

if ($PassThru) {
    [pscustomobject]@{
        LicenseKey = $licenseKey
        MaskedKey = $maskedKey
        OutputPath = $outputPath
        Plan = $remotePlan
        Devices = [int]$remoteDevices
        Expires = $remoteExpires
    }
}
