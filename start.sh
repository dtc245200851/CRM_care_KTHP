#!/usr/bin/env bash
# ==============================================================================
# MASTER SCRIPT KHỞI CHẠY TOÀN BỘ HỆ THỐNG CRM CARE TRONG 1 CÂU LỆNH (LINUX/MAC)
# Sử dụng: ./start.sh
# ==============================================================================
set -e

echo -e "\033[1;36m================================================================\033[0m"
echo -e "\033[1;36m   🚀 KHỞI CHẠY TOÀN BỘ HỆ THỐNG CRM CARE (1 CÂU LỆNH DUY NHẤT)\033[0m"
echo -e "\033[1;36m================================================================\033[0m"

# 1. Kiểm tra cấu hình .env
echo -e "\n\033[1;33m[Bước 1/6] Kiểm tra cấu hình biến môi trường...\033[0m"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "\033[1;32m -> Đã tự động tạo file .env từ .env.example!\033[0m"
    fi
else
    echo -e "\033[1;32m -> File .env đã sẵn sàng.\033[0m"
fi

# 2. Kiểm tra Docker Engine
echo -e "\n\033[1;33m[Bước 2/6] Kiểm tra dịch vụ Docker Engine...\033[0m"
if ! docker info > /dev/null 2>&1; then
    echo -e "\033[1;31m❌ LỖI: Docker Engine chưa được khởi chạy!\033[0m"
    echo -e "\033[1;33m👉 Vui lòng mở ứng dụng Docker Desktop hoặc chạy 'sudo systemctl start docker' rồi chạy lại ./start.sh\033[0m"
    exit 1
fi
echo -e "\033[1;32m -> Docker Engine đang hoạt động tốt!\033[0m"

# 3. Khởi chạy 12 Container
echo -e "\n\033[1;33m[Bước 3/6] Build và khởi chạy toàn bộ 12 containers...\033[0m"
docker compose up -d --build

# 4. Chờ PostgreSQL sẵn sàng
echo -e "\n\033[1;33m[Bước 4/6] Chờ CSDL PostgreSQL sẵn sàng...\033[0m"
until docker exec crm_postgres pg_isready -U crm_user -d crm_care > /dev/null 2>&1; do
    echo -e "    ... đang chờ PostgreSQL"
    sleep 2
done
echo -e "\033[1;32m -> PostgreSQL đã sẵn sàng!\033[0m"

# 5. Khởi tạo CSDL và Seed Data
echo -e "\n\033[1;33m[Bước 5/6] Đồng bộ CSDL và nạp dữ liệu mẫu (Seed Data)...\033[0m"
sleep 3
docker exec crm_backend npx prisma db push --accept-data-loss
docker exec crm_backend npm run seed
echo -e "\033[1;32m -> Đã nạp thành công 20 Doanh nghiệp, 30 Liên hệ, 50 Tương tác và 3 Tài khoản demo!\033[0m"

# 6. Kiểm tra sức khỏe
echo -e "\n\033[1;33m[Bước 6/6] Kiểm tra sức khỏe các dịch vụ...\033[0m"
if [ -f "./scripts/health-check.sh" ]; then
    chmod +x ./scripts/health-check.sh
    ./scripts/health-check.sh
fi

echo -e "\n\033[1;32m================================================================\033[0m"
echo -e "\033[1;32m   🎉 HỆ THỐNG CRM CARE ĐÃ KHỞI CHẠY THÀNH CÔNG RỰC RỠ!\033[0m"
echo -e "\033[1;32m================================================================\033[0m"
echo -e " 🌐 Ứng dụng CRM Care : \033[1;37mhttp://localhost\033[0m"
echo -e "    -> Tài khoản Admin : \033[1;36madmin@crmcare.local   / Admin@CRM2024!\033[0m"
echo -e "    -> Tài khoản Quản lý: \033[1;36mmanager@crmcare.local / Manager@CRM2024!\033[0m"
echo -e "    -> Tài khoản Staff : \033[1;36mstaff@crmcare.local   / Staff@CRM2024!\033[0m"
echo -e ""
echo -e " 🐘 Quản trị pgAdmin 4 : \033[1;37mhttp://localhost:5051\033[0m (admin@crmcare.local / PgAdm1n@SecureP@ss2024!)"
echo -e " 📈 Giám sát Grafana   : \033[1;37mhttp://localhost:3000\033[0m (admin / Gr@fana@SecureP@ss2024!)"
echo -e " 📊 Prometheus Metrics : \033[1;37mhttp://localhost:9091\033[0m"
echo -e " 📋 Loki Log Engine    : \033[1;37mhttp://localhost:3101\033[0m"
echo -e "\033[1;32m================================================================\033[0m"
echo -e "💡 Để dừng toàn bộ hệ thống bất cứ lúc nào, chạy: docker compose down"
