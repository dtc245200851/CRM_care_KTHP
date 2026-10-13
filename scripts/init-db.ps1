# ==============================================================================
# Script PowerShell khởi tạo Database và nạp dữ liệu mẫu cho CRM Care (Windows)
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "🚀 [1/3] Kiểm tra trạng thái PostgreSQL..." -ForegroundColor Cyan
docker exec crm_postgres pg_isready -U crm_user -d crm_care

Write-Host "🔄 [2/3] Thực hiện Prisma DB Push..." -ForegroundColor Cyan
docker exec crm_backend npx prisma db push --accept-data-loss

Write-Host "🌱 [3/3] Nạp dữ liệu mẫu (Seed Data)..." -ForegroundColor Cyan
docker exec crm_backend npm run prisma:seed

Write-Host "✅ Khởi tạo và nạp dữ liệu CRM Care hoàn tất thành công!" -ForegroundColor Green
