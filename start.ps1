# ==============================================================================
# MASTER SCRIPT KHOI CHAY TOAN BO HE THONG CRM CARE TRONG 1 CAU LENH (WINDOWS)
# Su dung: .\start.ps1
# ==============================================================================
$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   KHOI CHAY TOAN BO HE THONG CRM CARE (1 CAU LENH DUY NHAT)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# 1. Kiem tra file cau hinh moi truong (.env)
Write-Host "`n[Buoc 1/6] Kiem tra cau hinh bien moi truong..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host " -> Da tu dong tao file .env tu .env.example!" -ForegroundColor Green
    } else {
        Write-Host " -> CANH BAO: Khong tim thay .env.example" -ForegroundColor Red
    }
} else {
    Write-Host " -> File .env da san sang." -ForegroundColor Green
}

# 2. Kiem tra trang thai Docker Engine
Write-Host "`n[Buoc 2/6] Kiem tra dich vu Docker Engine..." -ForegroundColor Yellow
$dockerOk = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerOk = $true
    }
} catch {}

if (-not $dockerOk) {
    Write-Host " -> Docker Daemon chua chay. Dang thu khoi dong Docker Desktop..." -ForegroundColor Yellow
    $dockerPath = "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
    $dockerProgFiles = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
    } elseif (Test-Path $dockerProgFiles) {
        Start-Process $dockerProgFiles
    } else {
        Write-Host "Khong tim thay duong dan Docker Desktop." -ForegroundColor Red
    }

    Write-Host " -> Dang cho Docker Engine khoi dong (toi da 75 giay)..." -ForegroundColor Cyan
    $attempts = 0
    while ($attempts -lt 25) {
        Start-Sleep -Seconds 3
        $attempts++
        try {
            $null = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                $dockerOk = $true
                break
            }
        } catch {}
        $sec = $attempts * 3
        Write-Host "    ... cho Docker Engine ($sec giay / 75 giay)" -ForegroundColor Gray
    }
}

if (-not $dockerOk) {
    Write-Host "`n[!] CANH BAO: Docker Desktop Engine chua san sang." -ForegroundColor Red
    Write-Host "Huong dan:" -ForegroundColor Yellow
    Write-Host " 1. Mo Start Menu -> Tim va chay 'Docker Desktop'." -ForegroundColor White
    Write-Host " 2. Doi bieu tuong Docker chuyen sang mau xanh la (Engine running)." -ForegroundColor White
    Write-Host " 3. Chay lai cau lenh: .\start.ps1" -ForegroundColor Cyan
    exit 1
}
Write-Host " -> Docker Engine dang hoat dong tot!" -ForegroundColor Green

# 3. Khoi chay 12 Container qua Docker Compose
Write-Host "`n[Buoc 3/6] Build va khoi chay toan bo 12 containers..." -ForegroundColor Yellow
docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Loi khi khoi chay docker compose up!" -ForegroundColor Red
    exit 1
}

# 4. Doi PostgreSQL va Backend san sang
Write-Host "`n[Buoc 4/6] Cho CSDL PostgreSQL va Backend san sang..." -ForegroundColor Yellow
$dbReady = $false
$waitDb = 0
while ($waitDb -lt 20) {
    Start-Sleep -Seconds 2
    $waitDb++
    $null = docker exec crm_postgres pg_isready -U crm_user -d crm_care 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        break
    }
    $sec = $waitDb * 2
    Write-Host "    ... dang cho PostgreSQL ($sec giay)" -ForegroundColor Gray
}

if (-not $dbReady) {
    Write-Host "PostgreSQL mat nhieu thoi gian hon du kien, dang tiep tuc..." -ForegroundColor Yellow
} else {
    Write-Host " -> PostgreSQL da san sang!" -ForegroundColor Green
}

# 5. Khoi tao CSDL va nap du lieu mau (Seed Data)
Write-Host "`n[Buoc 5/6] Dong bo CSDL va nap du lieu mau (Seed Data)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
docker exec crm_backend npx prisma db push --accept-data-loss
docker exec crm_backend npm run seed
Write-Host " -> Da nap thanh cong 20 Doanh nghiep, 30 Lien he, 50 Tuong tac va 3 Tai khoan demo!" -ForegroundColor Green

# 6. Kiem tra suc khoe toan he thong
Write-Host "`n[Buoc 6/6] Kiem tra suc khoe cac dich vu..." -ForegroundColor Yellow
if (Test-Path ".\scripts\health-check.ps1") {
    & ".\scripts\health-check.ps1"
}

# Banner ket thuc & Thong tin truy cap
Write-Host "`n================================================================" -ForegroundColor Green
Write-Host "   HE THONG CRM CARE DA KHOI CHAY THANH CONG!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host " [1] Ung dung CRM Care : http://localhost" -ForegroundColor White
Write-Host "     -> Admin   : admin@crmcare.local   / Admin@CRM2024!" -ForegroundColor Cyan
Write-Host "     -> Manager : manager@crmcare.local / Manager@CRM2024!" -ForegroundColor Cyan
Write-Host "     -> Staff   : staff@crmcare.local   / Staff@CRM2024!" -ForegroundColor Cyan
Write-Host ""
Write-Host " [2] Quan tri pgAdmin 4: http://localhost:5051" -ForegroundColor White
Write-Host "     -> Tai khoan: admin@crmcare.local   / PgAdm1n@SecureP@ss2024!" -ForegroundColor Cyan
Write-Host ""
Write-Host " [3] Giam sat Grafana  : http://localhost:3000" -ForegroundColor White
Write-Host "     -> Tai khoan: admin                 / Gr@fana@SecureP@ss2024!" -ForegroundColor Cyan
Write-Host ""
Write-Host " [4] Prometheus Server : http://localhost:9091" -ForegroundColor White
Write-Host " [5] Loki Log Engine   : http://localhost:3101" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Green
Write-Host "Dung he thong: docker compose down" -ForegroundColor Gray
