#!/bin/bash
# ==============================================================================
# Script kiểm tra sức khỏe và kết nối các dịch vụ trong CRM Care
# ==============================================================================

echo "================================================================"
echo "          KIỂM TRA SỨC KHỎE HỆ THỐNG CRM CARE"
echo "================================================================"

check_service() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"

    http_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
    if [ "$http_code" = "$expected_code" ]; then
        echo -e " [OK]  $name: HTTP $http_code ($url)"
    else
        echo -e " [ERR] $name: HTTP $http_code (Expected $expected_code at $url)"
    fi
}

echo ""
echo "--- 1. Kiểm tra Dịch vụ Ứng dụng & Nginx ---"
check_service "Nginx Status" "http://localhost/nginx_status" "200"
check_service "Frontend Web" "http://localhost/" "200"
check_service "Backend Health API" "http://localhost/api/health" "200"
check_service "Backend Metrics" "http://localhost/metrics" "200"

echo ""
echo "--- 2. Kiểm tra Quản trị & Giám sát ---"
check_service "pgAdmin Interface" "http://localhost:5051/misc/ping" "200"
check_service "Prometheus Server" "http://localhost:9091/-/healthy" "200"
check_service "Grafana Dashboard" "http://localhost:3000/api/health" "200"
check_service "Loki Ready" "http://localhost:3101/ready" "200"

echo ""
echo "--- 3. Kiểm tra Trạng thái Container ---"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "crm_|NAME"

echo ""
echo "================================================================"
