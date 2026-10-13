# ==============================================================================
# Script sao lưu tự động PostgreSQL Database cho CRM Care (Windows PowerShell)
# ==============================================================================
$ErrorActionPreference = "Stop"

$BackupDir = Join-Path (Get-Location) "database\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "crm_care_backup_$Timestamp.sql"

Write-Host "📦 Đang thực hiện sao lưu cơ sở dữ liệu crm_care..." -ForegroundColor Cyan
docker exec crm_postgres pg_dump -U crm_user -d crm_care --clean --if-exists | Out-File -FilePath $BackupFile -Encoding utf8

$FileSize = (Get-Item $BackupFile).Length / 1KB
Write-Host "✅ Sao lưu thành công: $BackupFile" -ForegroundColor Green
Write-Host "📊 Kích thước bản sao lưu: $([math]::Round($FileSize, 2)) KB" -ForegroundColor Green
