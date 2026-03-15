#!/bin/bash
# Gold Shop Midea - Auto Deploy (tự động toàn bộ quy trình)
# Chạy: ./auto-deploy.sh dienphat-midea.vn

set -e

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: $0 <domain>"
  echo "Ví dụ: $0 dienphat-midea.vn"
  exit 1
fi

SITE_URL="https://$DOMAIN"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_DEPLOY="$PROJECT_ROOT/.env.deploy"
ENV_EXAMPLE="$PROJECT_ROOT/.env.deploy.example"
S3_BUCKET="${S3_DEPLOY_BUCKET:-gold-shop-midea}"
AWS_REGION="ap-southeast-1"

echo ""
echo "========================================"
echo "  Gold Shop Midea - Auto Deploy"
echo "  Domain: $DOMAIN"
echo "========================================"
echo ""

# Bước 0: Kiểm tra prerequisites
echo ">>> Bước 0: Kiểm tra prerequisites"
for cmd in aws docker terraform; do
  if ! command -v $cmd &>/dev/null; then
    echo "  Thiếu: $cmd"
    exit 1
  fi
done
echo "  OK: AWS CLI, Docker, Terraform"

if ! aws sts get-caller-identity &>/dev/null; then
  echo "  Lỗi: Chạy 'aws configure' trước"
  exit 1
fi
echo "  OK: AWS đã cấu hình"
echo ""

# Bước 1: Tạo .env.deploy nếu chưa có (từ backend/.env hoặc .env.deploy.example)
BACKEND_ENV="$PROJECT_ROOT/backend/.env"
if [[ ! -f "$ENV_DEPLOY" ]]; then
  echo ">>> Bước 1: Tạo .env.deploy"
  if [[ -f "$BACKEND_ENV" ]]; then
    grep -E '^(MONGODB_URI|JWT_SECRET|JWT_EXPIRES_IN|S3_REGION|S3_BUCKET_NAME|S3_ACCESS_KEY_ID|S3_SECRET_ACCESS_KEY)=' "$BACKEND_ENV" 2>/dev/null > "$ENV_DEPLOY" || true
    grep -q '^JWT_EXPIRES_IN=' "$ENV_DEPLOY" 2>/dev/null || echo "JWT_EXPIRES_IN=1d" >> "$ENV_DEPLOY"
    echo "  Đã tạo .env.deploy từ backend/.env"
  elif [[ -f "$ENV_EXAMPLE" ]]; then
    cp "$ENV_EXAMPLE" "$ENV_DEPLOY"
    echo "  Đã tạo .env.deploy từ .env.deploy.example"
    echo "  QUAN TRỌNG: Mở .env.deploy và điền MONGODB_URI, JWT_SECRET, S3 keys, sau đó chạy lại"
    exit 0
  else
    echo "  Không tìm thấy backend/.env hay .env.deploy.example"
    exit 1
  fi
else
  echo ">>> Bước 1: .env.deploy đã tồn tại"
fi
echo ""

# Bước 2: Tạo S3 bucket nếu chưa có
echo ">>> Bước 2: Kiểm tra S3 bucket $S3_BUCKET"
if ! aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
  echo "  Tạo bucket $S3_BUCKET..."
  aws s3 mb "s3://$S3_BUCKET" --region "$AWS_REGION"
  echo "  Đã tạo bucket"
else
  echo "  Bucket đã tồn tại"
fi
echo ""

# Bước 3: Chạy deploy
echo ">>> Bước 3: Chạy deploy (Terraform + Build + Deploy EC2)"
echo "  Thời gian ước tính: 5-10 phút"
echo ""

"$SCRIPT_DIR/deploy.sh" --site-url "$SITE_URL"

# Bước 4: Hiển thị hướng dẫn DNS
echo ""
echo "========================================"
echo "  HƯỚNG DẪN TRỎ TÊN MIỀN TẠI HOSTINGER"
echo "========================================"
echo ""

TERRAFORM_DIR="$PROJECT_ROOT/infra/terraform"
ELASTIC_IP=$(cd "$TERRAFORM_DIR" && terraform output -raw web_instance_elastic_ip 2>/dev/null || echo "N/A")

echo "1. Đăng nhập https://www.hostinger.vn"
echo "2. Vào Domains > chọn $DOMAIN > DNS / Manage DNS"
echo "3. Thêm 2 bản ghi A:"
echo ""
echo "   Type | Name | Value"
echo "   -----|------|------------------"
echo "   A    | @    | $ELASTIC_IP"
echo "   A    | www  | $ELASTIC_IP"
echo ""
echo "4. Lưu và đợi 5-30 phút để DNS cập nhật"
echo ""
echo "Kiểm tra ngay: http://$ELASTIC_IP"
echo "Sau khi DNS xong: $SITE_URL"
echo ""
