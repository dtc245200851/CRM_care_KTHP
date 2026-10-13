# HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH CRM CARE

Tài liệu này cung cấp các bước chi tiết để khởi chạy, cấu hình và kiểm thử hệ thống **CRM Care** trên môi trường cục bộ hoặc máy chủ thực tế.

---

## 1. Yêu cầu Hệ thống

- **Hệ điều hành:** Linux, macOS, hoặc Windows (có hỗ trợ WSL2 / Docker Desktop).
- **Phần mềm bắt buộc:**
  - Docker Engine >= 24.0.0
  - Docker Compose >= 2.20.0
  - Git >= 2.40.0
- **Phần cứng tối thiểu:** 2 CPU Cores, 4GB RAM, 10GB dung lượng đĩa trống.

---

## 2. Quy trình Triển khai 3 Giai đoạn

### Giai đoạn 1: Triển khai Cụm CRM Lõi (Database + Backend + Frontend + Nginx + pgAdmin)

1. Sao chép file cấu hình môi trường:
   ```bash
   cp .env.example .env
   ```
2. Khởi động các container cốt lõi:
   ```bash
   docker compose up -d --build
   ```
3. Khởi tạo Database và nạp dữ liệu mẫu ban đầu:
   ```bash
   # Trên Linux/macOS:
   chmod +x scripts/init-db.sh && ./scripts/init-db.sh

   # Hoặc trên Windows PowerShell:
   .\scripts\init-db.ps1
   ```
4. Kiểm tra dịch vụ:
   - Truy cập giao diện CRM: [http://localhost](http://localhost)
   - Truy cập pgAdmin: [http://localhost:5051](http://localhost:5051)

---

### Giai đoạn 2: Triển khai Hệ thống Giám sát Prometheus & Grafana

1. Khởi động cụm giám sát:
   ```bash
   docker compose -f docker-compose.monitoring.yml up -d prometheus grafana postgres-exporter nginx-exporter node-exporter
   ```
2. Kiểm tra giao diện:
   - Prometheus: [http://localhost:9091](http://localhost:9091) -> Vào mục **Status > Targets** để kiểm tra các endpoint đang UP.
   - Grafana: [http://localhost:3000](http://localhost:3000) -> Đăng nhập bằng `admin` / `Gr@fana@SecureP@ss2024!` -> Mở dashboard **CRM Care - Dashboard Giám Sát Toàn Diện**.

---

### Giai đoạn 3: Triển khai Hệ thống Ghi nhật ký Loki & Promtail

1. Khởi động Loki và Promtail:
   ```bash
   docker compose -f docker-compose.monitoring.yml up -d loki promtail
   ```
2. Kiểm tra trạng thái:
   - Kiểm tra Loki: [http://localhost:3101/ready](http://localhost:3101/ready)
   - Vào Grafana > **Explore** > Chọn Datasource **Loki** > Nhập truy vấn `{job="nginx"}` hoặc `{job="backend"}` để xem nhật ký trực tiếp.

---

## 3. Các Lệnh Vận hành Thường dùng

| Tác vụ | Lệnh thực thi |
| :--- | :--- |
| **Kiểm tra sức khỏe hệ thống** | `./scripts/health-check.sh` hoặc `.\scripts\health-check.ps1` |
| **Sao lưu cơ sở dữ liệu** | `./scripts/backup.sh` hoặc `.\scripts\backup.ps1` |
| **Phục hồi cơ sở dữ liệu** | `./scripts/restore.sh <file_path>` |
| **Xem log thời gian thực** | `docker compose logs -f backend` |
| **Dừng toàn bộ hệ thống** | `docker compose down` |

---

## 4. Xử lý Sự cố Thường gặp (Troubleshooting)

### Lỗi 1: `failed to connect to the docker API`
- **Nguyên nhân:** Dịch vụ Docker Desktop trên máy chưa được bật hoặc tiến trình VM đang bị treo.
- **Cách khắc phục:**
  1. Mở Start Menu trên Windows, gõ **Docker Desktop** và khởi chạy ứng dụng.
  2. Đợi biểu tượng cá voi chuyển sang trạng thái màu xanh lá (Engine running).
  3. Mở Terminal và chạy lại `docker ps` để xác nhận.

### Lỗi 2: Trùng cổng 80 hoặc 5000
- **Nguyên nhân:** Đang có web server khác (IIS, Apache, Skype) chiếm cổng 80 hoặc tiến trình Node chiếm cổng 5000.
- **Cách khắc phục:** Mở file `.env`, đổi cổng sang cổng phụ (ví dụ `PORT=5001`, sửa cổng Nginx sang `8080:80`).
