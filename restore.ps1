# Uso: .\restore.ps1 -Sufijo clean|seed   (restaura ambas BD desde backups\<sufijo>_v1.sql / _v2.sql)
param([ValidateSet('clean','seed')][string]$Sufijo = 'seed')
$ErrorActionPreference = 'Stop'
$env:Path += ';C:\Program Files\Docker\Docker\resources\bin'
Set-Location $PSScriptRoot
$e = @{}; Get-Content .env | % { $k,$v = $_ -split '=',2; if($k){$e[$k]=$v} }
foreach ($v in 'v1','v2') {
  $f = "backups\${Sufijo}_$v.sql"
  if (-not (Test-Path $f)) { throw "No existe $f" }
  docker exec "orangehrm-lab-db_$v-1" mariadb -uroot "-p$($e.DB_ROOT_PASSWORD)" -e "DROP DATABASE IF EXISTS $($e.DB_NAME); CREATE DATABASE $($e.DB_NAME) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  Get-Content $f -Raw -Encoding UTF8 | docker exec -i "orangehrm-lab-db_$v-1" mariadb -uroot "-p$($e.DB_ROOT_PASSWORD)" $e.DB_NAME
  docker restart "orangehrm-lab-ohrm_$v-1" | Out-Null
  Write-Host "Restaurada $v desde $f"
}
