# ==============================================================================
# Script phục hồi Database CRM Care từ bản sao lưu (Windows PowerShell)
# Sử dụng: .\scripts\restore.ps1 -BackupFile "database\backups\crm_care_backup_xxx.sql"
# ==============================================================================
param (
    [Parameter(Mandatory = $true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "❌ Lỗi: File $BackupFile không tồn tại!"
    exit 1
}

Write-Host "⚠️ CẢNH BÁO: Thao tác này sẽ ghi đè dữ liệu hiện tại trong crm_care." -ForegroundColor Yellow
$Confirmation = Read-Host "Bạn có chắc chắn muốn tiếp tục? (y/N)"
if ($Confirmation -notmatch "^[Yy]$") {
    Write-Host "Đã hủy thao tác phục hồi." -ForegroundColor Gray
    exit 0
}

Write-Host "🔄 Đang phục hồi dữ liệu từ $BackupFile..." -ForegroundColor Cyan
Get-Content -Path $BackupFile -Raw | docker exec -i crm_postgres psql -U crm_user -d crm_care

Write-Host "✅ Phục hồi dữ liệu thành công!" -ForegroundColor Green
