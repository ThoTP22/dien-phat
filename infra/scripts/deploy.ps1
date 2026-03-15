# Gold Shop Midea - Deploy script (PowerShell)
# Chạy: .\deploy.ps1 -SiteUrl "https://dienphat-midea.vn"

param(
    [switch]$SkipTerraform,
    [switch]$SkipBuild,
    [switch]$SkipFrontend,
    [switch]$SkipBackend,
    [string]$SiteUrl = "https://dienphat-midea.vn",
    [string]$EnvFile = ".env.deploy"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$TerraformDir = Join-Path $ProjectRoot "infra\terraform"
$DockerDir = Join-Path $ProjectRoot "infra\docker"
$S3Bucket = if ($env:S3_DEPLOY_BUCKET) { $env:S3_DEPLOY_BUCKET } else { "gold-shop-midea" }
$S3Prefix = "deploy"

Write-Host "=== Gold Shop Midea - Deploy ===" -ForegroundColor Cyan
Write-Host "Site URL: $SiteUrl`n"

if (-not $SkipTerraform) {
    Write-Host ">>> Buoc 1: Terraform apply" -ForegroundColor Yellow
    Push-Location $TerraformDir
    terraform init -input=false
    terraform apply -auto-approve -input=false
    Pop-Location
    Write-Host ""
}

Write-Host ">>> Buoc 2: Lay thong tin tu Terraform" -ForegroundColor Yellow
Push-Location $TerraformDir
$ECRFrontend = terraform output -raw ecr_frontend_url
$ECRBackend = terraform output -raw ecr_backend_url
$InstanceId = terraform output -raw web_instance_id
$ElasticIp = try { terraform output -raw web_instance_elastic_ip } catch { "" }
$AwsRegion = try { terraform output -raw aws_region } catch { "ap-southeast-1" }
Pop-Location

Write-Host "  ECR Frontend: $ECRFrontend"
Write-Host "  ECR Backend:  $ECRBackend"
Write-Host "  Instance ID:  $InstanceId`n"

$DoBuild = -not $SkipBuild
$DoFrontend = $DoBuild -and -not $SkipFrontend
$DoBackend = $DoBuild -and -not $SkipBackend

if ($DoFrontend -or $DoBackend) {
    Write-Host ">>> Buoc 3: Dang nhap ECR" -ForegroundColor Yellow
    $AwsAccountId = aws sts get-caller-identity --query Account --output text
    $LoginCmd = aws ecr get-login-password --region $AwsRegion
    $LoginCmd | docker login --username AWS --password-stdin "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
    Write-Host ""
}

if ($DoFrontend) {
    Write-Host ">>> Buoc 4: Build va push Frontend" -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "frontend")
    docker build `
        --build-arg "NEXT_PUBLIC_API_BASE_URL=/api" `
        --build-arg "NEXT_PUBLIC_SITE_URL=$SiteUrl" `
        -t "${ECRFrontend}:latest" .
    docker push "${ECRFrontend}:latest"
    Pop-Location
    Write-Host ""
}

if ($DoBackend) {
    Write-Host ">>> Buoc 5: Build va push Backend" -ForegroundColor Yellow
    Push-Location (Join-Path $ProjectRoot "backend")
    docker build -t "${ECRBackend}:latest" .
    docker push "${ECRBackend}:latest"
    Pop-Location
    Write-Host ""
}

Write-Host ">>> Buoc 6: Tao file cau hinh deploy" -ForegroundColor Yellow
$DeployDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_.FullName }

Copy-Item (Join-Path $DockerDir "docker-compose.prod.yml") $DeployDir
Copy-Item (Join-Path $DockerDir "nginx.conf") $DeployDir

$SiteHost = ($SiteUrl -replace "^https?://", "" -replace "/.*", "")
$CorsOrigins = "$SiteUrl,http://$SiteHost" + $(if ($ElasticIp) { ",http://$ElasticIp,https://$ElasticIp" } else { "" })
$envContent = @"
FRONTEND_IMAGE=${ECRFrontend}:latest
BACKEND_IMAGE=${ECRBackend}:latest
CORS_ORIGIN=$CorsOrigins
"@

$EnvFilePath = Join-Path $ProjectRoot $EnvFile
if (Test-Path $EnvFilePath) {
    Write-Host "  Doc bien moi truong tu $EnvFilePath"
    $envContent += "`n" + (Get-Content $EnvFilePath -Raw)
} else {
    Write-Host "  Canh bao: Khong tim thay $EnvFilePath" -ForegroundColor Red
}
Set-Content (Join-Path $DeployDir ".env") $envContent

Write-Host ">>> Buoc 7: Upload len S3" -ForegroundColor Yellow
aws s3 cp $DeployDir "s3://$S3Bucket/$S3Prefix/" --recursive
Write-Host ""

Write-Host ">>> Buoc 8: Chay deploy tren EC2 qua SSM" -ForegroundColor Yellow
$ECRRegistry = ($ECRFrontend -split "/")[0]
$Commands = @(
    "set -e",
    "cd /opt/app",
    "aws s3 cp s3://$S3Bucket/$S3Prefix/ . --recursive",
    "aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $ECRRegistry",
    "docker-compose -f docker-compose.prod.yml pull",
    "docker-compose -f docker-compose.prod.yml up -d",
    "docker-compose -f docker-compose.prod.yml ps"
)
$CmdJson = ($Commands | ForEach-Object { "`"$_`"" }) -join ","
$CommandId = aws ssm send-command `
    --instance-ids $InstanceId `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=[$CmdJson]" `
    --region $AwsRegion `
    --output text `
    --query "Command.CommandId"
$CommandId = $CommandId.Trim()

Write-Host "  Command ID: $CommandId"
Write-Host "`n>>> Doi SSM command hoan thanh (khoang 1-2 phut)..."
$ErrorActionPreferenceBak = $ErrorActionPreference
$ErrorActionPreference = "Continue"
aws ssm wait command-executed --command-id $CommandId --instance-id $InstanceId --region $AwsRegion 2>&1 | Out-Null
$ErrorActionPreference = $ErrorActionPreferenceBak
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Canh bao: SSM wait loi. Lay ket qua tren EC2..." -ForegroundColor Yellow
    $inv = aws ssm get-command-invocation --command-id $CommandId --instance-id $InstanceId --region $AwsRegion 2>$null | ConvertFrom-Json
    if ($inv) {
        Write-Host "  Status: $($inv.Status)" -ForegroundColor $(if ($inv.Status -eq "Success") { "Green" } else { "Red" })
        if ($inv.StandardErrorContent) { Write-Host "  Stderr: $($inv.StandardErrorContent)" }
        if ($inv.StandardOutputContent) { Write-Host "  Stdout: $($inv.StandardOutputContent)" }
    }
}

Write-Host "`n=== Deploy xong ===" -ForegroundColor Green
Push-Location $TerraformDir
$ElasticIp = terraform output -raw web_instance_elastic_ip 2>$null
Pop-Location
Write-Host "Elastic IP: $ElasticIp"
Write-Host "Tro ten mien tai Hostinger: A record @ va www -> $ElasticIp"
Write-Host "Kiem tra: http://$ElasticIp"
