# HỆ THỐNG GIÁM SÁT & QUẢN TRỊ NHẬT KÝ (MONITORING & LOGGING)

Hệ thống **CRM Care** tích hợp bộ giải pháp quan sát toàn diện (Observability Stack) chuẩn Cloud-Native bao gồm: **Prometheus**, **Grafana**, **Loki**, **Promtail** và **pgAdmin**.

---

## 1. Cổng Thông tin & Dịch vụ Giám sát

| Dịch vụ | URL Truy cập | Tài khoản / Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Grafana** | `http://localhost:3000` | `admin` / `Gr@fana@SecureP@ss2024!` | Trực quan hóa số liệu và tra cứu Log |
| **Prometheus** | `http://localhost:9091` | Không cần mật khẩu | Công cụ thu thập và lưu trữ Metrics |
| **pgAdmin 4** | `http://localhost:5051` | `admin@crmcare.local` / `PgAdm1n@SecureP@ss2024!` | Quản trị và truy vấn PostgreSQL trực quan |
| **Loki API** | `http://localhost:3101` | API Nội bộ | Kho lưu trữ log tập trung |

---

## 2. Các Chỉ số Giám sát Chính (Key Metrics)

### 2.1. Số liệu API & Lưu lượng (CRM Backend)
- `http_requests_total`: Tổng số lượt gọi API phân theo mã trạng thái HTTP (`2xx`, `4xx`, `5xx`).
- `http_request_duration_seconds`: Thời gian phản hồi của API (đo lường độ trễ qua hàm phân vị `p95`, `median`).
- `nodejs_active_handles` & `nodejs_heap_size_total_bytes`: Mức sử dụng bộ nhớ và tài nguyên của Node.js runtime.

### 2.2. Số liệu Cơ sở dữ liệu (PostgreSQL Exporter)
- `pg_stat_activity_count`: Số lượng kết nối đang hoạt động (Active DB Connections).
- `pg_stat_database_xact_commit`: Số lượng giao dịch thành công mỗi giây (Commits/s).
- `pg_stat_database_xact_rollback`: Số lượng giao dịch bị rollback.

### 2.3. Số liệu Cổng Proxy (Nginx Exporter)
- `nginx_connections_active`: Số lượng kết nối đồng thời qua Reverse Proxy.
- `nginx_http_requests_total`: Tổng lưu lượng mạng được định tuyến.

---

## 3. Truy vấn Log bằng Loki (LogQL)

Tại trang **Grafana > Explore**, chọn nguồn dữ liệu **Loki**:

- Xem toàn bộ log của Nginx Reverse Proxy:
  ```logql
  {job="nginx"}
  ```
- Lọc các yêu cầu HTTP gặp lỗi (4xx và 5xx):
  ```logql
  {job="nginx"} | json | status >= 400
  ```
- Xem log của Backend API:
  ```logql
  {job="backend"}
  ```
- Tìm các dòng log chứa thông báo lỗi (Error):
  ```logql
  {job="backend"} |= "error"
  ```
