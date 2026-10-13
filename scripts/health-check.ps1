# ==============================================================================
# Script kiểm tra sức khỏe và kết nối các dịch vụ trong CRM Care (PowerShell)
# ==============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "          KIỂM TRA SỨC KHỎE HỆ THỐNG CRM CARE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

function Check-Service {
    param (
        [string]$Name,
        [string]$Url,
        [int]$ExpectedCode = 200
    )

    $retries = 3
    for ($i = 1; $i -le $retries; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            $statusCode = $response.StatusCode
            if ($statusCode -eq $ExpectedCode) {
                Write-Host " [OK]   $($Name) - HTTP $statusCode ($Url)" -ForegroundColor Green
                return
            }
        } catch {
            if ($i -lt $retries) {
                Start-Sleep -Seconds 2
            }
        }
    }
    Write-Host " [ERR]  $($Name) - Khong the ket noi toi $Url" -ForegroundColor Red
}

Write-Host "`n--- 1. Kiểm tra Dịch vụ Ứng dụng & Nginx ---" -ForegroundColor White
Check-Service -Name "Nginx Status" -Url "http://localhost/nginx_status" -ExpectedCode 200
Check-Service -Name "Frontend Web" -Url "http://localhost/" -ExpectedCode 200
Check-Service -Name "Backend Health API" -Url "http://localhost/api/health" -ExpectedCode 200
Check-Service -Name "Backend Metrics" -Url "http://localhost/metrics" -ExpectedCode 200

Write-Host "`n--- 2. Kiểm tra Quản trị & Giám sát ---" -ForegroundColor White
Check-Service -Name "pgAdmin Interface" -Url "http://localhost:5051/misc/ping" -ExpectedCode 200
Check-Service -Name "Prometheus Server" -Url "http://localhost:9091/-/healthy" -ExpectedCode 200
Check-Service -Name "Grafana Dashboard" -Url "http://localhost:3000/api/health" -ExpectedCode 200
Check-Service -Name "Loki Ready" -Url "http://localhost:3101/ready" -ExpectedCode 200

Write-Host "`n--- 3. Kiểm tra Trạng thái Container ---" -ForegroundColor White
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "crm_|NAME"

Write-Host "`n================================================================" -ForegroundColor Cyan
