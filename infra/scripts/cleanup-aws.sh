#!/bin/bash
# Cleanup AWS - Destroy Terraform infrastructure
# Chay: ./cleanup-aws.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/infra/terraform"

echo "=== Cleanup AWS Infrastructure ==="
echo "Se destroy: VPC, EC2, ECR, Security Group, IAM, Elastic IP"
echo ""

read -p "Ban chac chan muon xoa? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Huy."
    exit 0
fi

cd "$TERRAFORM_DIR"
terraform init -input=false
terraform destroy -auto-approve -input=false

echo ""
echo "Done. AWS resources da bi xoa."
echo ""
echo "Luu y: S3 bucket 'gold-shop-midea' KHONG duoc tao boi Terraform."
echo "Neu muon xoa S3, chay thu cong trong AWS Console hoac:"
echo "  aws s3 rb s3://gold-shop-midea --force"
