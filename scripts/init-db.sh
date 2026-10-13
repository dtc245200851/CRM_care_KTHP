#!/bin/bash
# ==============================================================================
# Script khởi tạo Database và nạp dữ liệu mẫu cho CRM Care
# ==============================================================================
set -e

echo "🚀 [1/3] Kiểm tra trạng thái PostgreSQL..."
docker exec crm_postgres pg_isready -U crm_user -d crm_care

echo "🔄 [2/3] Thực hiện Prisma Migrate trên container backend..."
docker exec crm_backend npx prisma db push --accept-data-loss

echo "🌱 [3/3] Nạp dữ liệu mẫu (Seed Data)..."
docker exec crm_backend npm run prisma:seed

echo "✅ Khởi tạo và nạp dữ liệu CRM Care hoàn tất thành công!"
