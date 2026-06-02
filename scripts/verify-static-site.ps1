$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$stylesPath = Join-Path $root 'styles.css'
$appPath = Join-Path $root 'app.js'
$assetsPath = Join-Path $root 'assets\designs'

foreach ($path in @($indexPath, $stylesPath, $appPath, $assetsPath)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing required path: $path"
  }
}

$index = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
$app = [System.IO.File]::ReadAllText($appPath, [System.Text.Encoding]::UTF8)

foreach ($needle in @('styles.css', 'app.js', 'designGrid', 'requestForm')) {
  if (($index + $app) -notmatch [regex]::Escape($needle)) {
    throw "Missing expected site marker: $needle"
  }
}

$matches = [regex]::Matches($app, '"([^"]+\.(?:jpg|jpeg|png|webp))"')
if ($matches.Count -lt 1) {
  throw 'No design image references found in app.js'
}

foreach ($match in $matches) {
  $fileName = $match.Groups[1].Value
  $path = Join-Path $assetsPath $fileName
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing design asset: $fileName"
  }
}

Write-Host "Static site verification passed ($($matches.Count) design assets)."
