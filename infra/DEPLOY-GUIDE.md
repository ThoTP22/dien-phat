# Hướng dẫn Deploy Gold Shop Midea lên AWS VPC (Terraform)

Bạn đã mua tên miền trên Hostinger. Hướng dẫn này giúp bạn deploy ứng dụng lên VPC AWS và trỏ tên miền về server.

---

## Deploy tự động (AWS CLI)

**Cách nhanh nhất** - chạy 1 lệnh:

```bash
# Linux/Mac (Git Bash trên Windows)
cd infra/scripts
chmod +x deploy.sh
./deploy.sh --site-url "https://dienphat-midea.vn"
```

```powershell
# PowerShell (Windows)
cd infra\scripts
.\deploy.ps1 -SiteUrl "https://dienphat-midea.vn"
```

**Chuẩn bị trước:**
1. Cài [AWS CLI](https://aws.amazon.com/cli/) và chạy `aws configure`
2. Cài [Docker](https://www.docker.com/)
3. Cài [Terraform](https://developer.hashicorp.com/terraform/downloads)
4. Tạo file `.env.deploy` tại thư mục gốc project (copy từ `.env.deploy.example`)

**Tùy chọn:**
- `--skip-terraform` - Bỏ qua terraform (infra đã có)
- `--skip-build` - Chỉ deploy lại lên EC2, không build image mới

---

## Tổng quan thủ công

1. **Terraform** tạo VPC, EC2, ECR, Security Group
2. **EC2** chạy Docker (frontend Next.js + backend Express + nginx)
3. **Hostinger DNS** trỏ tên miền về Elastic IP của EC2
4. **SSL** dùng Let's Encrypt (certbot) trên EC2

---

## Bước 1: Chuẩn bị

### 1.1 Cài đặt

- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.6
- [AWS CLI](https://aws.amazon.com/cli/) đã cấu hình (`aws configure`)
- Tên miền đã mua trên Hostinger (ví dụ: `dienphat-midea.vn`)

### 1.2 Tạo file `terraform.tfvars`

```bash
cd infra/terraform
```

Tạo file `terraform.tfvars`:

```hcl
aws_region      = "ap-southeast-1"
project_name    = "gold-shop-midea"
environment     = "prod"
instance_type   = "t3.small"

# Chỉ cho phép SSH từ IP của bạn (tùy chọn)
ssh_allowed_cidr = "YOUR_IP/32"   # Thay YOUR_IP bằng IP public của bạn
```

---

## Bước 2: Chạy Terraform

```bash
cd infra/terraform

# Tạo file biến (nếu chưa có)
cp terraform.tfvars.example terraform.tfvars
# Chỉnh sửa terraform.tfvars theo nhu cầu

# Khởi tạo
terraform init

# Xem kế hoạch
terraform plan

# Áp dụng
terraform apply
```

Sau khi chạy xong, ghi lại output:
- **`web_instance_elastic_ip`** - Dùng IP này để trỏ tên miền tại Hostinger

---

## Bước 3: Cấu hình DNS tại Hostinger

1. Đăng nhập [Hostinger](https://www.hostinger.vn)
2. Vào **Domains** > chọn tên miền > **DNS / Nameservers**
3. Thêm các bản ghi:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `<Elastic_IP_hoặc_Public_IP>` | 300 |
| A | www | `<Elastic_IP_hoặc_Public_IP>` | 300 |

**Lưu ý**: Dùng **Elastic IP** (không đổi khi restart EC2). Nếu chưa có, xem Bước 4.

---

## Bước 4: Elastic IP (khuyến nghị)

Để IP không đổi khi EC2 restart, Terraform đã thêm Elastic IP. Sau `terraform apply`, output sẽ có `web_instance_elastic_ip`. Dùng IP này cho bản ghi A tại Hostinger.

---

## Bước 5: Deploy ứng dụng lên EC2

### 5.1 Kết nối EC2

```bash
# Dùng AWS SSM (không cần mở port 22)
aws ssm start-session --target <instance-id> --region ap-southeast-1

# Hoặc SSH (nếu đã mở port 22 và có key)
ssh -i your-key.pem ec2-user@<public-ip>
```

### 5.2 Cài Docker Compose và chạy app

Trên EC2, tạo thư mục và file:

```bash
sudo mkdir -p /opt/app
sudo chown ec2-user:ec2-user /opt/app
cd /opt/app
```

Tạo `docker-compose.yml` (hoặc copy từ repo):

```yaml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend

  frontend:
    image: your-registry/gold-shop-frontend:latest
    environment:
      - NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
      - NEXT_PUBLIC_SITE_URL=https://your-domain.com

  backend:
    image: your-registry/gold-shop-backend:latest
    environment:
      - NODE_ENV=production
      - MONGODB_URI=...
      - S3_BUCKET=...
```

### 5.3 Build và push Docker image

Trên máy local:

```bash
# Frontend
cd frontend
docker build -t gold-shop-frontend .
docker tag gold-shop-frontend YOUR_ECR_OR_REGISTRY/gold-shop-frontend:latest
docker push YOUR_ECR_OR_REGISTRY/gold-shop-frontend:latest

# Backend
cd ../backend
docker build -t gold-shop-backend .
docker tag gold-shop-backend YOUR_ECR_OR_REGISTRY/gold-shop-backend:latest
docker push YOUR_ECR_OR_REGISTRY/gold-shop-backend:latest
```

---

## Bước 6: Cấu hình SSL (HTTPS)

### 6.1 Cập nhật Security Group

Terraform đã mở port 443. Đảm bảo Security Group cho phép:
- 80 (HTTP) - để certbot xác thực
- 443 (HTTPS)

### 6.2 Cài Certbot trên EC2

```bash
sudo yum install -y certbot
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

Certificates nằm tại `/etc/letsencrypt/live/your-domain.com/`

### 6.3 Cấu hình Nginx reverse proxy

Nginx nhận request 80/443, proxy tới frontend (3000) và backend (4000).

---

## Bước 7: Biến môi trường

Tạo `.env` trên EC2 hoặc truyền qua Docker:

**Frontend** (`.env.production`):
```
NEXT_PUBLIC_SITE_URL=https://dienphat-midea.vn
NEXT_PUBLIC_API_BASE_URL=https://dienphat-midea.vn/api
```

**Backend**:
```
MONGODB_URI=mongodb+srv://...
S3_BUCKET=gold-shop-midea
```

---

## Checklist triển khai

- [ ] Terraform apply thành công
- [ ] Ghi lại Elastic IP
- [ ] Trỏ A record @ và www tại Hostinger về Elastic IP
- [ ] Build và push Docker images
- [ ] Cài Docker Compose trên EC2
- [ ] Chạy `docker compose up -d`
- [ ] Cài SSL (certbot) và cấu hình Nginx
- [ ] Kiểm tra https://your-domain.com

---

## Lưu ý Hostinger

- DNS propagation có thể mất 5–30 phút
- Nếu dùng Cloudflare (proxy), có thể bật SSL Full tại Cloudflare
- Hostinger có thể cung cấp SSL miễn phí nếu dùng hosting của họ; khi dùng EC2 riêng thì dùng Let's Encrypt
