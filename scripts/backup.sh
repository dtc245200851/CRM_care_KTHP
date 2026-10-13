#!/bin/bash
# ==============================================================================
# Script sao lưu tự động PostgreSQL Database cho CRM Care
# ==============================================================================
set -e

BACKUP_DIR="$(pwd)/database/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/crm_care_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "📦 Đang thực hiện sao lưu cơ sở dữ liệu crm_care..."
docker exec -t crm_postgres pg_dump -U crm_user -d crm_care --clean --if-exists > "${BACKUP_FILE}"

echo "🔒 Tạo bản nén gzip..."
gzip -f "${BACKUP_FILE}"

echo "✅ Sao lưu thành công: ${BACKUP_FILE}.gz"
echo "📊 Kích thước bản sao lưu: $(ls -lh "${BACKUP_FILE}.gz" | awk '{print $5}')"
