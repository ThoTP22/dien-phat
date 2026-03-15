#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INFRA_DIR="$PROJECT_ROOT/infra"
TERRAFORM_DIR="$INFRA_DIR/terraform"
DOCKER_DIR="$INFRA_DIR/docker"
S3_BUCKET="${S3_DEPLOY_BUCKET:-gold-shop-midea}"
S3_PREFIX="deploy"

usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --skip-terraform    Bỏ qua terraform apply (dùng khi infra đã có)"
  echo "  --skip-build        Bỏ qua build/push Docker (chỉ chạy deploy lên EC2)"
  echo "  --site-url URL      URL website (ví dụ: https://dienphat-midea.vn)"
  echo "  --env-file FILE     File .env cho backend (mặc định: .env.deploy)"
  exit 1
}

SKIP_TERRAFORM=false
SKIP_BUILD=false
SITE_URL="${SITE_URL:-https://dienphat-midea.vn}"
ENV_FILE="$PROJECT_ROOT/.env.deploy"

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-terraform) SKIP_TERRAFORM=true; shift ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    --site-url) SITE_URL="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

echo "=== Gold Shop Midea - Deploy ==="
echo "Site URL: $SITE_URL"
echo ""

if [[ "$SKIP_TERRAFORM" != "true" ]]; then
  echo ">>> Bước 1: Terraform apply"
  cd "$TERRAFORM_DIR"
  terraform init -input=false
  terraform apply -auto-approve -input=false
  cd "$PROJECT_ROOT"
  echo ""
fi

echo ">>> Bước 2: Lấy thông tin từ Terraform"
cd "$TERRAFORM_DIR"
ECR_FRONTEND=$(terraform output -raw ecr_frontend_url)
ECR_BACKEND=$(terraform output -raw ecr_backend_url)
INSTANCE_ID=$(terraform output -raw web_instance_id)
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "ap-southeast-1")
cd "$PROJECT_ROOT"

echo "  ECR Frontend: $ECR_FRONTEND"
echo "  ECR Backend:  $ECR_BACKEND"
echo "  Instance ID:  $INSTANCE_ID"
echo ""

if [[ "$SKIP_BUILD" != "true" ]]; then
  echo ">>> Bước 3: Đăng nhập ECR"
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
  echo ""

  echo ">>> Bước 4: Build và push Frontend"
  cd "$PROJECT_ROOT/frontend"
  docker build \
    --build-arg NEXT_PUBLIC_API_BASE_URL="$SITE_URL/api" \
    --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
    -t "$ECR_FRONTEND:latest" .
  docker push "$ECR_FRONTEND:latest"
  cd "$PROJECT_ROOT"
  echo ""

  echo ">>> Bước 5: Build và push Backend"
  cd "$PROJECT_ROOT/backend"
  docker build -t "$ECR_BACKEND:latest" .
  docker push "$ECR_BACKEND:latest"
  cd "$PROJECT_ROOT"
  echo ""
fi

echo ">>> Bước 6: Tạo file cấu hình deploy"
DEPLOY_DIR=$(mktemp -d)
trap "rm -rf $DEPLOY_DIR" EXIT

cp "$DOCKER_DIR/docker-compose.prod.yml" "$DEPLOY_DIR/"
cp "$DOCKER_DIR/nginx.conf" "$DEPLOY_DIR/"

cat > "$DEPLOY_DIR/.env" << EOF
FRONTEND_IMAGE=$ECR_FRONTEND:latest
BACKEND_IMAGE=$ECR_BACKEND:latest
CORS_ORIGIN=$SITE_URL
EOF

if [[ -f "$ENV_FILE" ]]; then
  echo "  Đọc biến môi trường từ $ENV_FILE"
  grep -E '^[A-Z_]+=.' "$ENV_FILE" >> "$DEPLOY_DIR/.env" 2>/dev/null || true
else
  echo "  Cảnh báo: Không tìm thấy $ENV_FILE"
  echo "  Tạo file .env.deploy với: MONGODB_URI, JWT_SECRET, S3_REGION, S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY"
  cat >> "$DEPLOY_DIR/.env" << 'ENVEOF'

MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
S3_REGION=ap-southeast-1
S3_BUCKET_NAME=gold-shop-midea
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
ENVEOF
fi

echo ">>> Bước 7: Upload lên S3"
aws s3 cp "$DEPLOY_DIR/" "s3://$S3_BUCKET/$S3_PREFIX/" --recursive
echo ""

echo ">>> Bước 8: Chạy deploy trên EC2 qua SSM"
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[\"set -e\",\"cd /opt/app\",\"aws s3 cp s3://$S3_BUCKET/$S3_PREFIX/ . --recursive\",\"docker-compose -f docker-compose.prod.yml pull\",\"docker-compose -f docker-compose.prod.yml up -d\",\"docker-compose -f docker-compose.prod.yml ps\"]" \
  --region "$AWS_REGION" \
  --output text \
  --query "Command.CommandId")

echo ""
echo ">>> Đợi SSM command hoàn thành (khoảng 1-2 phút)..."
sleep 10
aws ssm wait command-executed --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" --region "$AWS_REGION" 2>/dev/null || echo "  (Có thể command vẫn đang chạy - kiểm tra EC2 sau vài phút)"

echo ""
echo "=== Deploy xong ==="
cd "$TERRAFORM_DIR"
ELASTIC_IP=$(terraform output -raw web_instance_elastic_ip 2>/dev/null || echo "N/A")
echo "Elastic IP: $ELASTIC_IP"
echo "Trỏ tên miền tại Hostinger: A record @ và www -> $ELASTIC_IP"
echo "Kiểm tra: http://$ELASTIC_IP"
