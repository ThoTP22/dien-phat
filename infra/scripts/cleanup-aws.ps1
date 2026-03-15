# Cleanup AWS - Destroy Terraform infrastructure
# Chay: .\cleanup-aws.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$TerraformDir = Join-Path $ProjectRoot "infra\terraform"

Write-Host "=== Cleanup AWS Infrastructure ===" -ForegroundColor Cyan
Write-Host "Se destroy: VPC, EC2, ECR, Security Group, IAM, Elastic IP`n"

$confirm = Read-Host "Ban chac chan muon xoa? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Huy." -ForegroundColor Yellow
    exit 0
}

Push-Location $TerraformDir
try {
    terraform init -input=false
    terraform destroy -auto-approve -input=false
    Write-Host "`nDone. AWS resources da bi xoa." -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host "`nLuu y: S3 bucket 'gold-shop-midea' KHONG duoc tao boi Terraform."
Write-Host "Neu muon xoa S3, chay thu cong trong AWS Console hoac:"
Write-Host "  aws s3 rb s3://gold-shop-midea --force"
