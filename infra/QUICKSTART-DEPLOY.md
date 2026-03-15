# Khởi tạo Deploy và Gắn Tên Miền

Hướng dẫn deploy lần đầu và trỏ tên miền Hostinger về server.

---

## Cách nhanh nhất: Auto Deploy (1 lệnh)

**Thay `dienphat-midea.vn` bằng tên miền thật của bạn.**

### Windows (PowerShell)

```powershell
cd c:\dien-phat\infra\scripts
.\auto-deploy.ps1 -Domain "dienphat-midea.vn"
```

### Linux/Mac (Git Bash)

```bash
cd c:/dien-phat/infra/scripts
chmod +x auto-deploy.sh
./auto-deploy.sh dienphat-midea.vn
```

**Script tự động:**
1. Kiểm tra AWS CLI, Docker, Terraform
2. Tạo `.env.deploy` từ example (lần đầu - cần điền rồi chạy lại)
3. Tạo S3 bucket nếu chưa có
4. Terraform apply + Build Docker + Push ECR + Deploy EC2
5. In hướng dẫn trỏ tên miền tại Hostinger

**Lần đầu:** Nếu chưa có `.env.deploy`, script tạo file và dừng. Mở `.env.deploy`, điền MONGODB_URI, JWT_SECRET, S3 keys, rồi chạy lại lệnh trên.

---

## Chuẩn bị trước (lần đầu)

### Cài đặt

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) - mở và chạy
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.6
- AWS CLI đã cấu hình (`aws configure`)

### File `.env.deploy`

Nếu script chưa tạo, copy thủ công:

```bash
copy .env.deploy.example .env.deploy
```

Điền: `MONGODB_URI`, `JWT_SECRET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

---

## Chạy Deploy thủ công (không dùng auto-deploy)

```powershell
cd c:\dien-phat\infra\scripts
.\deploy.ps1 -SiteUrl "https://dienphat-midea.vn"
```

---

## Bước 3: Lấy Elastic IP

Sau khi deploy xong, script in ra Elastic IP. Hoặc chạy:

```bash
cd c:\dien-phat\infra\terraform
terraform output web_instance_elastic_ip
```

Ví dụ output: `54.123.45.67`

---

## Bước 4: Trỏ Tên Miền tại Hostinger

1. Đăng nhập [Hostinger](https://www.hostinger.vn)
2. Vào **Domains** > chọn tên miền (ví dụ: `dienphat-midea.vn`)
3. Chọn **DNS / Nameservers** hoặc **Manage DNS**
4. Thêm/sửa bản ghi:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `54.123.45.67` | 300 |
| A | www | `54.123.45.67` | 300 |

*(Thay `54.123.45.67` bằng Elastic IP từ Bước 3)*

5. Lưu và đợi 5–30 phút để DNS cập nhật.

---

## Bước 5: Kiểm tra

- **Trước khi DNS xong:** mở `http://<Elastic_IP>` (ví dụ: `http://54.123.45.67`)
- **Sau khi DNS xong:** mở `http://dienphat-midea.vn` và `http://www.dienphat-midea.vn`

---

## Bước 6: Bật HTTPS (SSL) - Tùy chọn

Sau khi tên miền đã trỏ đúng, SSH/SSM vào EC2 và cài Let's Encrypt:

```bash
# Kết nối EC2 qua SSM
aws ssm start-session --target <instance-id> --region ap-southeast-1

# Trên EC2
sudo dnf install -y certbot
sudo certbot certonly --standalone -d dienphat-midea.vn -d www.dienphat-midea.vn
```

Sau đó cập nhật nginx để dùng certificate (cần chỉnh cấu hình nginx cho HTTPS).

---

## Lệnh hữu ích

```bash
# Deploy lại (không chạy Terraform)
.\deploy.ps1 -SkipTerraform -SiteUrl "https://dienphat-midea.vn"

# Chỉ deploy lên EC2, không build image mới
.\deploy.ps1 -SkipBuild -SiteUrl "https://dienphat-midea.vn"

# Đổi tên miền
.\deploy.ps1 -SiteUrl "https://ten-mien-khac.vn"
```

---

## Xử lý lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `S3 bucket does not exist` | Tạo bucket: `aws s3 mb s3://gold-shop-midea` |
| `SSM command failed` | Đợi 2–3 phút sau khi EC2 khởi động, chạy lại deploy |
| `Docker login failed` | Kiểm tra `aws configure` và quyền ECR |
| Website không mở được | Kiểm tra Security Group mở port 80, 443 |
