$ErrorActionPreference = 'Stop'

$sandboxDirectory = Join-Path $env:USERPROFILE '.codex\.sandbox'
$stateFile = Join-Path $sandboxDirectory 'setup_error.json'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFile = Join-Path $sandboxDirectory "setup_error.json.corrupt-$timestamp.bak"

Write-Host "Codex sandbox directory: $sandboxDirectory"

if (-not (Test-Path -LiteralPath $sandboxDirectory)) {
  Write-Host 'No Codex sandbox state directory exists. Restart Codex to recreate it.'
  exit 0
}

if (Test-Path -LiteralPath $stateFile) {
  try {
    Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json | Out-Null
    Write-Host 'setup_error.json is valid JSON. It will be preserved.'
  } catch {
    Move-Item -LiteralPath $stateFile -Destination $backupFile
    Write-Host "Backed up corrupt state file to: $backupFile"
  }
} else {
  Write-Host 'setup_error.json is not present.'
}

$probeFile = Join-Path $sandboxDirectory "write-probe-$timestamp.tmp"
try {
  Set-Content -LiteralPath $probeFile -Value 'ok' -Encoding ascii
  Remove-Item -LiteralPath $probeFile
  Write-Host 'Sandbox state directory is writable.'
} catch {
  Write-Warning "Sandbox state directory is not writable: $($_.Exception.Message)"
}

Write-Host 'Repair check complete. Fully close and reopen Codex before retrying commands.'
