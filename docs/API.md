# TÀI LIỆU REST API CRM CARE

Hệ thống API backend được xây dựng trên nền tảng Express.js và tuân thủ chuẩn RESTful. Mọi yêu cầu được bảo vệ bằng JWT Authentication (ngoại trừ các endpoint công khai).

**Base URL:** `http://localhost/api` (hoặc trực tiếp qua backend: `http://localhost:5000/api`)

---

## 1. Authentication (Xác thực)

### Đăng nhập
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Quyền:** Public (Có Rate Limiting 5 req/s)
- **Request Body:**
  ```json
  {
    "email": "admin@crmcare.local",
    "password": "Admin@CRM2024!"
  }
  ```
- **Response thành công (200):**
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "cm2...",
        "name": "Quản Trị Viên",
        "email": "admin@crmcare.local",
        "role": "ADMIN"
      }
    }
  }
  ```

### Lấy thông tin tài khoản hiện tại
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Header:** `Authorization: Bearer <token>`

---

## 2. Quản lý Khách hàng (Customers)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/customers` | Lấy danh sách khách hàng (hỗ trợ phân trang, tìm kiếm, lọc theo status, sắp xếp) |
| `GET` | `/api/customers/:id` | Xem chi tiết khách hàng và danh sách liên hệ/tương tác |
| `POST` | `/api/customers` | Thêm mới khách hàng |
| `PUT` | `/api/customers/:id` | Cập nhật thông tin khách hàng |
| `DELETE`| `/api/customers/:id` | Xóa khách hàng khỏi hệ thống |

**Tham số Query cho `GET /api/customers`:**
- `page`: Số trang (mặc định 1)
- `limit`: Số bản ghi mỗi trang (mặc định 10)
- `search`: Từ khóa tìm theo tên, email, công ty, mã khách hàng
- `status`: `ACTIVE`, `INACTIVE`, `PROSPECT`, `CHURNED`
- `sortBy`: `createdAt`, `name`, `company`, v.v.
- `sortOrder`: `asc` hoặc `desc`

---

## 3. Quản lý Người liên hệ (Contacts)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/contacts` | Lấy danh sách người liên hệ (hỗ trợ lọc theo `customerId`) |
| `GET` | `/api/contacts/:id` | Chi tiết người liên hệ |
| `POST` | `/api/contacts` | Tạo mới người liên hệ thuộc khách hàng |
| `PUT` | `/api/contacts/:id` | Cập nhật thông tin người liên hệ |
| `DELETE`| `/api/contacts/:id` | Xóa người liên hệ |

---

## 4. Quản lý Lịch sử Tương tác (Interactions)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/interactions` | Lấy danh sách tương tác (lọc theo `customerId`, `type`, `status`) |
| `GET` | `/api/interactions/:id`| Chi tiết tương tác |
| `POST` | `/api/interactions` | Ghi nhận cuộc gọi, email, buổi họp mới |
| `PUT` | `/api/interactions/:id`| Cập nhật ghi chú và trạng thái tương tác |
| `DELETE`| `/api/interactions/:id`| Xóa bản ghi tương tác |

---

## 5. Thống kê & Giám sát

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Dữ liệu thống kê tổng hợp phục vụ biểu đồ Dashboard |
| `GET` | `/api/health` | Kiểm tra trạng thái Database connection và thời gian hoạt động Uptime |
| `GET` | `/metrics` | Xuất số liệu chuẩn Prometheus format |
