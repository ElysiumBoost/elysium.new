# Local preview — run from project root:  .\preview.ps1
$ErrorActionPreference = "Stop"
$Port = 8765
$Root = $PSScriptRoot

Set-Location $Root
if (-not (Test-Path "index.html")) {
  Write-Error "index.html not found in $Root"
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  Write-Host "Port $Port is already in use (PID $($listener.OwningProcess))."
  Write-Host "Open: http://127.0.0.1:$Port/#arc-raiders"
  exit 0
}

$py = $null
foreach ($cmd in @("python", "py")) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) {
    $py = $cmd
    break
  }
}
if (-not $py) {
  Write-Error "Python not found. Install Python or add it to PATH, then run again."
}

$url = "http://127.0.0.1:$Port/#arc-raiders"
Write-Host "Serving $Root"
Write-Host "Home:      http://127.0.0.1:$Port/"
Write-Host "Arc:       $url"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

Start-Process $url

$serveArgs = @("-m", "http.server", [string]$Port, "--bind", "127.0.0.1")
if ($py -eq "py") {
  & py -3 @serveArgs
} else {
  & python @serveArgs
}
