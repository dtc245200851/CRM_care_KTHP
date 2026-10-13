#!/bin/bash
# ==============================================================================
# Script phục hồi Database CRM Care từ bản sao lưu
# Sử dụng: ./scripts/restore.sh <duong_dan_file_backup.sql>
# ==============================================================================
set -e

if [ -z "$1" ]; then
    echo "❌ Lỗi: Vui lòng truyền đường dẫn file backup!"
    echo "Ví dụ: ./scripts/restore.sh database/backups/crm_care_backup_20241013.sql"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Lỗi: File $BACKUP_FILE không tồn tại!"
    exit 1
fi

echo "⚠️ CẢNH BÁO: Thao tác này sẽ ghi đè dữ liệu hiện tại trong crm_care."
read -p "Bạn có chắc chắn muốn tiếp tục? (y/N): " -r CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Đã hủy thao tác phục hồi."
    exit 0
fi

echo "🔄 Đang phục hồi dữ liệu từ $BACKUP_FILE..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker exec -i crm_postgres psql -U crm_user -d crm_care
else
    docker exec -i crm_postgres psql -U crm_user -d crm_care < "$BACKUP_FILE"
fi

echo "✅ Phục hồi dữ liệu thành công!"
