$ErrorActionPreference = 'Stop'

$codexDirectory = Join-Path $env:USERPROFILE '.codex'
$sandboxDirectory = Join-Path $codexDirectory '.sandbox'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDirectory = Join-Path $codexDirectory ".sandbox-backup-$timestamp"

if (-not (Test-Path -LiteralPath $sandboxDirectory)) {
  Write-Host 'No sandbox state directory exists. Codex will recreate it on startup.'
  exit 0
}

Move-Item -LiteralPath $sandboxDirectory -Destination $backupDirectory

Write-Host "Sandbox state was moved safely to:"
Write-Host $backupDirectory
Write-Host ''
Write-Host 'Nothing was deleted. Reopen Codex to create a fresh sandbox state.'
