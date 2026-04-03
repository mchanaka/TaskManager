# Ensures SQL Server LocalDB default instance is running (used by appsettings LocalDB connection string).
# Run from Cursor/VS Code terminal or: powershell -ExecutionPolicy Bypass -File scripts/ensure-localdb.ps1

$ErrorActionPreference = 'Continue'
$instance = 'mssqllocaldb'

$exe = Get-Command sqllocaldb.exe -ErrorAction SilentlyContinue
if (-not $exe) {
    Write-Host @"
SQL LocalDB (sqllocaldb.exe) was not found on PATH.

Install one of:
  - SQL Server Express LocalDB: https://go.microsoft.com/fwlink/?LinkID=799012
  - Or full SQL Server Express and choose the LocalDB feature

After installing, close and reopen Cursor so a new terminal picks up PATH (or restart Windows).
"@
    exit 1
}

Write-Host "Starting LocalDB instance '$instance'..."
& sqllocaldb.exe start $instance
$code = $LASTEXITCODE
if ($code -ne 0) {
    Write-Host "Start returned exit code $code. Listing instances:"
    & sqllocaldb.exe info
    exit $code
}

& sqllocaldb.exe info $instance
Write-Host "LocalDB is ready."
exit 0
