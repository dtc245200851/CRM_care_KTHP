# KIẾN TRÚC HỆ THỐNG CRM CARE

## 1. Tổng quan Kiến trúc

Hệ thống **CRM Care** được thiết kế theo mô hình kiến trúc Micro-services / Containerized Services hiện đại, đảm bảo tính sẵn sàng cao, bảo mật nhiều lớp và khả năng mở rộng linh hoạt.

```mermaid
graph TD
    User["Người dùng / Trình duyệt"] -->|HTTP / Port 80| Nginx["Nginx Reverse Proxy & Load Balancer"]
    
    subgraph Core_Services ["Cụm Dịch vụ CRM Lõi"]
        Nginx -->|/api/*| Backend["Node.js Express API (Port 5000)"]
        Nginx -->|/*| Frontend["React + Vite SPA (Port 80)"]
        Backend -->|Prisma ORM| Postgres[("PostgreSQL 16 Database (Port 5432)")]
    end

    subgraph Management ["Quản trị Cơ sở dữ liệu"]
        Admin["Quản trị viên DB"] -->|Port 5050| PgAdmin["pgAdmin 4 Web Interface"]
        PgAdmin --> Postgres
    end

    subgraph Monitoring_Stack ["Cụm Giám sát & Đo lường"]
        Prometheus["Prometheus Server (Port 9090)"]
        Grafana["Grafana Visualizer (Port 3000)"]
        
        Prometheus -->|Scrape /metrics| Backend
        Prometheus -->|Scrape :9187| PgExporter["Postgres Exporter"]
        Prometheus -->|Scrape :9113| NginxExporter["Nginx Exporter"]
        Prometheus -->|Scrape :9100| NodeExporter["Node Exporter"]
        
        PgExporter --> Postgres
        NginxExporter --> Nginx
        
        Grafana -->|Query Metrics| Prometheus
    end

    subgraph Logging_Stack ["Cụm Thu thập & Truy vấn Nhật ký"]
        Loki["Grafana Loki Log Store (Port 3100)"]
        Promtail["Promtail Log Shipper"]
        
        Promtail -->|Tail /var/log/nginx| Nginx
        Promtail -->|Tail /app/logs| Backend
        Promtail -->|Push Logs| Loki
        
        Grafana -->|Query Logs (LogQL)| Loki
    end
```

---

## 2. Các Phân hệ Thành phần

### 2.1. Nginx Reverse Proxy (Cổng vào Duy nhất)
- **Vai trò:** Điểm tiếp nhận toàn bộ lưu lượng HTTP từ bên ngoài tại cổng 80.
- **Tính năng bảo mật:**
  - Rate limiting chống brute-force cho API xác thực (`/api/auth/login`: tối đa 5 req/s).
  - Rate limiting cho API chung (`/api/`: tối đa 30 req/s).
  - Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`.
  - Nén dữ liệu Gzip tự động cho tĩnh và JSON.

### 2.2. Frontend (React + Vite + TypeScript + Tailwind CSS)
- Giao diện Single Page Application hiện đại, thiết kế theo hệ thống bảng màu thẩm mỹ cao.
- Quản lý trạng thái xác thực bằng Context API và lưu trữ JWT an toàn.
- Đầy đủ các phân hệ: Dashboard trực quan, Quản lý khách hàng, Người liên hệ, Lịch sử tương tác.
- Triển khai bằng Multi-stage Dockerfile với Nginx Alpine siêu nhẹ.

### 2.3. Backend (Node.js + Express + TypeScript + Prisma ORM)
- Kiến trúc phân tầng rõ ràng: Routes -> Middlewares -> Controllers -> Config -> Prisma Models.
- Tự động ghi nhận Metrics bằng thư viện chuẩn `prom-client` tại endpoint `/metrics`.
- Logging tập trung chuẩn cấu trúc JSON thông qua thư viện `pino`.
- Kiểm tra tính hợp lệ dữ liệu đầu vào nghiêm ngặt với thư viện `zod`.

### 2.4. PostgreSQL 16
- Cơ sở dữ liệu quan hệ lưu trữ dữ liệu chính.
- Bật sẵn các extension: `uuid-ossp`, `pgcrypto`, `pg_stat_statements`.
- Phân quyền nghiêm ngặt: User ứng dụng (`crm_user`) và User đọc số liệu giám sát (`crm_monitor`).

### 2.5. Prometheus & Grafana
- Thu thập toàn bộ số liệu (RPS, Latency, Error Rate, CPU, RAM, Connection Pool).
- Dashboard mẫu định sẵn (`crm-overview.json`) hiển thị tức thì không cần cấu hình thủ công.

### 2.6. Loki & Promtail
- Thu thập log Nginx và log backend theo thời gian thực.
- Cho phép quản trị viên truy vết lỗi và tra cứu sự cố thông qua Grafana Explore.
