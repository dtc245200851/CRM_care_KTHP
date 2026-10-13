.PHONY: start up down seed backup restore health logs

# Chạy toàn bộ hệ thống trong 1 câu lệnh duy nhất
start:
	@bash ./start.sh

# Khởi chạy Docker containers
up:
	docker compose up -d --build

# Dừng hệ thống
down:
	docker compose down

# Nạp dữ liệu mẫu
seed:
	@bash ./scripts/init-db.sh

# Sao lưu database
backup:
	@bash ./scripts/backup.sh

# Kiểm tra sức khỏe hệ thống
health:
	@bash ./scripts/health-check.sh

# Xem log theo thời gian thực
logs:
	docker compose logs -f
