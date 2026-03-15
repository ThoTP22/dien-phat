# Gold Shop Midea - Auto Deploy (tự động toàn bộ quy trình)
# Chạy: .\auto-deploy.ps1 -Domain "dienphat-midea.vn"

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain,
    [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$SiteUrl = "https://$Domain"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gold Shop Midea - Auto Deploy" -ForegroundColor Cyan
Write-Host "  Domain: $Domain" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buoc 0: Kiem tra prerequisites
if (-not $SkipChecks) {
    Write-Host ">>> Buoc 0: Kiem tra prerequisites" -ForegroundColor Yellow
    $missing = @()
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { $missing += "AWS CLI" }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $missing += "Docker" }
    if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) { $missing += "Terraform" }
    if ($missing.Count -gt 0) {
        Write-Host "  Thieu: $($missing -join ', ')" -ForegroundColor Red
        exit 1
    }
    Write-Host "  OK: AWS CLI, Docker, Terraform" -ForegroundColor Green
    Write-Host ""

    Write-Host "  Kiem tra AWS credentials..." -ForegroundColor Gray
    try {
        aws sts get-caller-identity | Out-Null
        Write-Host "  OK: AWS da cau hinh" -ForegroundColor Green
    } catch {
        Write-Host "  Loi: Chay 'aws configure' truoc" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Buoc 1: Tao .env.deploy neu chua co (tu backend/.env hoac .env.deploy.example)
$EnvDeployPath = Join-Path $ProjectRoot ".env.deploy"
$EnvExamplePath = Join-Path $ProjectRoot ".env.deploy.example"
$BackendEnvPath = Join-Path $ProjectRoot "backend\.env"

if (-not (Test-Path $EnvDeployPath)) {
    Write-Host ">>> Buoc 1: Tao .env.deploy" -ForegroundColor Yellow
    if (Test-Path $BackendEnvPath) {
        $vars = @("MONGODB_URI", "JWT_SECRET", "JWT_EXPIRES_IN", "S3_REGION", "S3_BUCKET_NAME", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY")
        $lines = Get-Content $BackendEnvPath | Where-Object {
            $line = $_.Trim()
            if (-not $line -or $line.StartsWith("#")) { return $false }
            foreach ($v in $vars) { if ($line.StartsWith("$v=")) { return $true } }
            return $false
        }
        if (-not ($lines | Where-Object { $_.StartsWith("JWT_EXPIRES_IN=") })) { $lines += "JWT_EXPIRES_IN=1d" }
        Set-Content $EnvDeployPath ($lines -join "`n")
        Write-Host "  Da tao .env.deploy tu backend\.env" -ForegroundColor Green
    } elseif (Test-Path $EnvExamplePath) {
        Copy-Item $EnvExamplePath $EnvDeployPath
        Write-Host "  Da tao .env.deploy tu .env.deploy.example" -ForegroundColor Green
        Write-Host "  QUAN TRONG: Mo .env.deploy va dien MONGODB_URI, JWT_SECRET, S3 keys, sau do chay lai" -ForegroundColor Red
        exit 0
    } else {
        Write-Host "  Khong tim thay backend\.env hay .env.deploy.example" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ">>> Buoc 1: .env.deploy da ton tai" -ForegroundColor Green
}
Write-Host ""

# Buoc 2: Tao S3 bucket neu chua co
$S3Bucket = if ($env:S3_DEPLOY_BUCKET) { $env:S3_DEPLOY_BUCKET } else { "gold-shop-midea" }
$AwsRegion = "ap-southeast-1"

Write-Host ">>> Buoc 2: Kiem tra S3 bucket $S3Bucket" -ForegroundColor Yellow
$null = aws s3api head-bucket --bucket $S3Bucket 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Tao bucket $S3Bucket..." -ForegroundColor Gray
    aws s3 mb "s3://$S3Bucket" --region $AwsRegion
    Write-Host "  Da tao bucket" -ForegroundColor Green
} else {
    Write-Host "  Bucket da ton tai" -ForegroundColor Green
}
Write-Host ""

# Buoc 3: Chay deploy
Write-Host ">>> Buoc 3: Chay deploy (Terraform + Build + Deploy EC2)" -ForegroundColor Yellow
Write-Host "  Thoi gian uoc tinh: 5-10 phut" -ForegroundColor Gray
Write-Host ""

$deployScript = Join-Path $PSScriptRoot "deploy.ps1"
& $deployScript -SiteUrl $SiteUrl

# Buoc 4: Hien thi huong dan DNS
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HUONG DAN TRO TEN MIEN TAI HOSTINGER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Push-Location (Join-Path $ProjectRoot "infra\terraform")
$ElasticIp = terraform output -raw web_instance_elastic_ip 2>$null
Pop-Location

Write-Host ""
Write-Host "1. Dang nhap https://www.hostinger.vn" -ForegroundColor White
Write-Host "2. Vao Domains > chon $Domain > DNS / Manage DNS" -ForegroundColor White
Write-Host "3. Them 2 ban ghi A:" -ForegroundColor White
Write-Host ""
Write-Host "   Type | Name | Value" -ForegroundColor Gray
Write-Host "   -----|------|------------------" -ForegroundColor Gray
Write-Host "   A    | @    | $ElasticIp" -ForegroundColor Yellow
Write-Host "   A    | www  | $ElasticIp" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Luu va doi 5-30 phut de DNS cap nhat" -ForegroundColor White
Write-Host ""
Write-Host "Kiem tra ngay: http://$ElasticIp" -ForegroundColor Green
Write-Host "Sau khi DNS xong: $SiteUrl" -ForegroundColor Green
Write-Host ""
