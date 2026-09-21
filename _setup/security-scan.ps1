param(
    [string]$Target = ".",
    [string]$Config = "",
    [switch]$BlockWarnings
)

$ErrorActionPreference = 'Continue'

# 查找 semgrep 可执行文件：优先环境变量 SEMGREP_BIN，其次 PATH，最后常见安装位置。
$semgrep = $null
if ($env:SEMGREP_BIN -and (Test-Path $env:SEMGREP_BIN)) {
    $semgrep = $env:SEMGREP_BIN
} else {
    $candidate = Get-Command semgrep* -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($candidate) { $semgrep = $candidate.Source }
}
if (-not $semgrep) {
    foreach ($p in @(
        'C:\Program Files\semgrep\semgrep.exe',
        'C:\tools\semgrep\semgrep.exe',
        "$env:USERPROFILE\.local\bin\semgrep.exe"
    )) {
        if (Test-Path $p) { $semgrep = $p; break }
    }
}
if (-not $semgrep) {
    Write-Host "[gate] semgrep not found. Set SEMGREP_BIN to its path or add it to PATH."
    exit 4
}

# 沙箱内 $PSScriptRoot 可能为空，须多级回退得到脚本目录，不能依赖 $HOME。
$ScriptBase = $PSScriptRoot
if (-not $ScriptBase -or -not (Test-Path $ScriptBase)) {
    try { $ScriptBase = Split-Path -Parent $MyInvocation.MyCommand.Path } catch { }
}
if (-not $ScriptBase) { $ScriptBase = (Get-Location).Path }
if (-not $Config) { $Config = $ScriptBase + '\security-rules' }

# 沙箱内 semgrep 须把缓存/日志写到可写的工作区（脚本目录内），避免写 $HOME/.semgrep 权限失败。
$gateCacheDir = '{0}\{1}' -f $ScriptBase, '.semgrep'
if (-not $gateCacheDir) { $gateCacheDir = $ScriptBase + '\' + '.semgrep' }
New-Item -ItemType Directory -Force -Path $gateCacheDir | Out-Null
$env:XDG_STATE_HOME  = $gateCacheDir
$env:XDG_CONFIG_HOME = $gateCacheDir
$env:XDG_CACHE_HOME  = $gateCacheDir
$env:SEMGREP_LOG_FILE      = $gateCacheDir + '\semgrep.log'
$env:SEMGREP_USER_LOG_FILE = $gateCacheDir + '\semgrep-user.log'

Write-Host "Security scan (semgrep) on: $Target"

# 用文件重定向捕获 stdout（JSON），stderr（进度日志）丢到旁路文件，避免被当成错误
$out = $ScriptBase + '\.scan-' + [guid]::NewGuid().ToString() + '.json'
$err = $out + '.e'
$null = & $semgrep scan --config $Config --json $Target 1> $out 2> $err
$json = Get-Content $out -Raw
if (-not $json) {
    Write-Host ("[scan] no output; outsize=" + (Get-Item $out).Length)
    Get-Content $err -ErrorAction SilentlyContinue | Select-Object -Last 15
    Remove-Item $out, $err -Force -ErrorAction SilentlyContinue
    exit 3
}
Remove-Item $out, $err -Force -ErrorAction SilentlyContinue

$obj = $json | ConvertFrom-Json
$findings = @($obj.results)
$errors = @($findings | Where-Object { $_.extra.severity -eq 'ERROR' })
$warns  = @($findings | Where-Object { $_.extra.severity -eq 'WARNING' })
$targets = ($obj.results | ForEach-Object { $_.path } | Sort-Object -Unique).Count

Write-Host ("  scanned files: {0}, findings: ERROR={1} WARNING={2}" -f $targets, $errors.Count, $warns.Count)

foreach ($f in $errors) {
    $rel = $f.path -replace [regex]::Escape((Get-Location).Path), '.'
    Write-Host ("  [ERROR] {0}:{1} {2}" -f $rel, $f.start.line, $f.extra.message)
}
foreach ($f in $warns) {
    if ($BlockWarnings) {
        $rel = $f.path -replace [regex]::Escape((Get-Location).Path), '.'
        Write-Host ("  [WARN ] {0}:{1} {2}" -f $rel, $f.start.line, $f.extra.message)
    }
}
Write-Host ("  total findings: {0}" -f $findings.Count)

$blocking = $errors
if ($BlockWarnings) { $blocking = $findings }
if ($blocking.Count -gt 0) {
    Write-Host ("[GATE] FAILED - {0} blocking finding(s). Fix them before push." -f $blocking.Count)
    exit 1
}
Write-Host "[GATE] PASSED"
exit 0