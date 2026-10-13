# SỔ TAY TOÀN TẬP CÁC CÂU LỆNH & GHI CHÚ VẬN HÀNH CRM CARE

> **DỰ ÁN:** CRM Care – Hệ Thống Quản Lý Quan Hệ Khách Hàng  
> **MÔN HỌC:** Triển Khai và Quản Trị Hệ Thống Phần Mềm (Đề tài 4)  
> **SINH VIÊN:** dtc245200851 | **MSSV:** dtc245200851  
> **GITHUB:** [https://github.com/dtc245200851/CRM_care_KTHP.git](https://github.com/dtc245200851/CRM_care_KTHP.git)

---

## MỤC LỤC
1. [Khởi chạy và Dừng hệ thống (1 câu lệnh)](#1-khởi-chạy-và-dừng-hệ-thống-1-câu-lệnh)
2. [Bảng thông tin Cổng kết nối & Tài khoản mặc định](#2-bảng-thông-tin-cổng-kết-nối--tài-khoản-mặc-định)
3. [Kiểm tra Sức khỏe và Giám sát Hệ thống](#3-kiểm-tra-sức-khỏe-và-giám-sát-hệ-thống)
4. [Quản trị Cơ sở Dữ liệu PostgreSQL](#4-quản-trị-cơ-sở-dữ-liệu-postgresql)
5. [Sao lưu & Phục hồi CSDL (Backup & Restore)](#5-sao-lưu--phục-hồi-csdl-backup--restore)
6. [Quản lý Logs (Nhật ký hệ thống)](#6-quản-lý-logs-nhật-ký-hệ-thống)
7. [Xử lý Sự cố thường gặp (Troubleshooting)](#7-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. KHỞI CHẠY VÀ DỪNG HỆ THỐNG (1 CÂU LỆNH)

Bạn có thể đứng ở bất kỳ thư mục nào (`C:\TRIENKHAI_01` hoặc `C:\TRIENKHAI_01\crm-care`) để thực hiện:

### 🚀 Khởi chạy toàn bộ 12 dịch vụ:
| Cách thực hiện | Câu lệnh | Ghi chú |
| :--- | :--- | :--- |
| **Cách 1 (Khuyên dùng)** | `npm start` | Chạy tốt trên cả Windows PowerShell, CMD, Git Bash |
| **Cách 2 (Batch File)** | `.\start.bat` | Hoặc click đúp chuột trực tiếp vào file `start.bat` |
| **Cách 3 (PowerShell)** | `powershell -ExecutionPolicy Bypass -File .\start.ps1` | Tự động vượt qua giới hạn quyền của Windows |
| **Cách 4 (Bash / Linux)**| `chmod +x start.sh; ./start.sh` | Dành cho Linux / macOS / WSL |

### 🛑 Dừng toàn bộ hệ thống:
```powershell
npm run down
```
*hoặc:*
```powershell
cd crm-care; docker compose down
```

---

## 2. BẢNG THÔNG TIN CỔNG KẾT NỐI & TÀI KHOẢN MẶC ĐỊNH

| Dịch vụ | Địa chỉ URL | Tài khoản đăng nhập | Mật khẩu |
| :--- | :--- | :--- | :--- |
| **Ứng dụng CRM Care** | [http://localhost](http://localhost) | `admin@crmcare.local`<br>`manager@crmcare.local`<br>`staff@crmcare.local` | `Admin@CRM2024!`<br>`Manager@CRM2024!`<br>`Staff@CRM2024!` |
| **Quản trị pgAdmin 4** | [http://localhost:5051](http://localhost:5051) | `admin@crmcare.local` | `PgAdm1n@SecureP@ss2024!` |
| **Bảng giám sát Grafana**| [http://localhost:3000](http://localhost:3000) | `admin` | `Gr@fana@SecureP@ss2024!` |
| **Prometheus Server** | [http://localhost:9091](http://localhost:9091) | *Không yêu cầu* | *Truy cập trực tiếp* |
| **Loki Log Engine** | [http://localhost:3101](http://localhost:3101) | *Không yêu cầu* | *Endpoint: /ready* |
| **PostgreSQL Database** | `localhost:5432` | `crm_user` (Database: `crm_care`) | `CrmCare@SecureP@ss2024!` |
| **Backend API Trực tiếp**| [http://localhost:5000](http://localhost:5000) | *Headers Bearer Token* | *(Đi qua Nginx cổng 80)* |

---

## 3. KIỂM TRA SỨC KHỎE VÀ GIÁM SÁT HỆ THỐNG

### 3.1. Kiểm tra sức khỏe tự động toàn diện (Health Check):
```powershell
npm run health
```
*Lệnh này sẽ quét toàn bộ 8 endpoint chính và bảng trạng thái của 12 container.*

### 3.2. Kiểm tra chỉ số số liệu (Prometheus & Exporters Metrics):
* **Xem danh sách các dịch vụ đang được Prometheus giám sát (Targets):**
  ```powershell
  curl http://localhost:9091/api/v1/targets
  ```
  *(Hoặc mở trình duyệt xem trực quan tại: [http://localhost:9091/targets](http://localhost:9091/targets))*

* **Xem số liệu Metrics chi tiết của Backend API:**
  ```powershell
  curl http://localhost/metrics
  ```

* **Xem số lượng kết nối Nginx đang xử lý:**
  ```powershell
  curl http://localhost/nginx_status
  ```

* **Kiểm tra trạng thái sẵn sàng của Loki:**
  ```powershell
  curl http://localhost:3101/ready
  ```

---

## 4. QUẢN TRỊ CƠ SỞ DỮ LIỆU POSTGRESQL

### 4.1. Kiểm tra trạng thái kết nối CSDL:
```powershell
docker exec crm_postgres pg_isready -U crm_user -d crm_care
```

### 4.2. Truy vấn kiểm tra số lượng dữ liệu đã nạp trong CSDL:
* **Đếm số lượng Khách hàng doanh nghiệp:**
  ```powershell
  docker exec crm_postgres psql -U crm_user -d crm_care -c "SELECT count(*) FROM customers;"
  ```
* **Đếm số lượng Người liên hệ:**
  ```powershell
  docker exec crm_postgres psql -U crm_user -d crm_care -c "SELECT count(*) FROM contacts;"
  ```
* **Đếm số lượng Lịch sử tương tác:**
  ```powershell
  docker exec crm_postgres psql -U crm_user -d crm_care -c "SELECT count(*) FROM interactions;"
  ```
* **Đếm số lượng Tài khoản người dùng:**
  ```powershell
  docker exec crm_postgres psql -U crm_user -d crm_care -c "SELECT count(*) FROM users;"
  ```

### 4.3. Truy cập vào cửa sổ dòng lệnh SQL tương tác trực tiếp (psql CLI):
```powershell
docker exec -it crm_postgres psql -U crm_user -d crm_care
```
*(Gõ `\q` rồi nhấn Enter để thoát).*

### 4.4. Nạp lại dữ liệu mẫu (Seed Data):
```powershell
docker exec crm_backend npm run seed
```

---

## 5. SAO LƯU & PHỤC HỒI CSDL (BACKUP & RESTORE)

### 5.1. Sao lưu dữ liệu ra file `.sql.gz` (Backup):
* **Trên Windows PowerShell:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\crm-care\scripts\backup.ps1
  ```
* **Trên Linux / Bash:**
  ```bash
  bash ./crm-care/scripts/backup.sh
  ```
*Thư mục lưu trữ file backup:* `crm-care/database/backups/crm_care_backup_YYYYMMDD_HHMMSS.sql.gz`

### 5.2. Khôi phục dữ liệu từ bản sao lưu (Restore):
* **Trên Windows PowerShell:**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\crm-care\scripts\restore.ps1
  ```
* **Trên Linux / Bash:**
  ```bash
  bash ./crm-care/scripts/restore.sh
  ```

---

## 6. QUẢN LÝ LOGS (NHẬT KÝ HỆ THỐNG)

### 6.1. Xem log các container trực tiếp qua Docker:
* **Log của Backend Server (API & Nghiệp vụ):**
  ```powershell
  docker logs crm_backend --tail 50 -f
  ```
* **Log của Nginx Reverse Proxy (Các lượt truy cập HTTP):**
  ```powershell
  docker logs crm_nginx --tail 50 -f
  ```
* **Log của Cơ sở dữ liệu PostgreSQL:**
  ```powershell
  docker logs crm_postgres --tail 50 -f
  ```
* **Log của Promtail (Thu thập và đẩy log vào Loki):**
  ```powershell
  docker logs crm_promtail --tail 50 -f
  ```
*(Nhấn `Ctrl + C` để dừng theo dõi log realtime).*

### 6.2. Xem Log tập trung trên giao diện Grafana (Explore):
1. Truy cập [http://localhost:3000](http://localhost:3000) ➡️ Đăng nhập `admin` / `Gr@fana@SecureP@ss2024!`.
2. Vào menu **Explore** (biểu tượng la bàn ở thanh bên trái).
3. Chọn Data source: **Loki**.
4. Nhập query: `{job="docker"}` hoặc `{container="crm_backend"}` rồi nhấn **Run query**.

---

## 7. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### ❌ Sự cố 1: Docker Desktop chưa bật hoặc Engine stopped
* **Hiện tượng:** Báo lỗi `failed to connect to the docker API at npipe...`
* **Cách khắc phục:** Mở Start Menu ➡️ tìm và mở **Docker Desktop**. Chờ biểu tượng cá voi chuyển màu xanh lá (*Engine running*) rồi chạy lại `npm start`.

### ❌ Sự cố 2: PowerShell báo lỗi quyền chặn script (ExecutionPolicy)
* **Hiện tượng:** `File start.ps1 cannot be loaded because running scripts is disabled...`
* **Cách khắc phục:** Dùng lệnh:
  ```powershell
  npm start
  ```
  hoặc:
  ```powershell
  .\start.bat
  ```

### ❌ Sự cố 3: Khởi động lại hệ thống sạch hoàn toàn (Clean Rebuild)
Nếu muốn xóa sạch toàn bộ dữ liệu tạm thời, xóa volumes và dựng lại hệ thống mới tinh từ đầu:
```powershell
cd crm-care
docker compose down -v
npm start
```
