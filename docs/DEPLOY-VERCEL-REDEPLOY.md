# Hướng dẫn Deploy lại Frontend + Backend trên Vercel

Vercel **không dùng port** – mọi thứ chạy qua HTTPS (443). Chỉ cần cấu hình đúng biến môi trường và thứ tự deploy.

---

## Kiểm tra nhanh

**Backend**: `https://dien-phat-backend.vercel.app/api/health`  
→ Nếu trả về JSON `{"success":true,...}` là backend chạy đúng.

**Frontend**: `https://dien-phat-frontend.vercel.app`  
→ Nếu load được trang nhưng không có dữ liệu → kiểm tra `API_SERVER_URL` trên frontend.

---

## Bước 1: Cấu hình Backend (dien-phat-backend)

1. Vào [vercel.com](https://vercel.com) > **dien-phat-backend** > **Settings** > **Environment Variables**
2. Đảm bảo có đủ:

| Biến | Giá trị | Ghi chú |
|------|---------|---------|
| `MONGODB_URI` | `mongodb+srv://...` | Connection string MongoDB Atlas |
| `JWT_SECRET` | Chuỗi bí mật | Ví dụ: `openssl rand -hex 32` |
| `S3_REGION` | `ap-southeast-1` | |
| `S3_BUCKET_NAME` | `gold-shop-midea` | |
| `S3_ACCESS_KEY_ID` | AWS Access Key | |
| `S3_SECRET_ACCESS_KEY` | AWS Secret Key | |
| `CORS_ORIGIN` | `https://dien-phat-frontend.vercel.app,https://*.vercel.app` | Cho phép frontend gọi API |

3. **Deployments** > **Redeploy** (chọn deployment mới nhất > **Redeploy**)

---

## Bước 2: Cấu hình Frontend (dien-phat-frontend)

1. Vào **dien-phat-frontend** > **Settings** > **Environment Variables**
2. Đảm bảo có đủ:

| Biến | Giá trị | Ghi chú |
|------|---------|---------|
| `API_SERVER_URL` | `https://dien-phat-backend.vercel.app/api` | **Bắt buộc** – URL backend |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | Client dùng proxy |
| `NEXT_PUBLIC_SITE_URL` | `https://dien-phat-frontend.vercel.app` | |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | `https://gold-shop-midea.s3.../products/hero-section.mp4` | Tùy chọn |

3. **Deployments** > **Redeploy**

---

## Bước 3: Thứ tự Redeploy

1. **Redeploy Backend trước** – đợi status **Ready**
2. **Redeploy Frontend sau** – để build dùng đúng `API_SERVER_URL`

---

## Không cần cấu hình Port

- Vercel dùng HTTPS mặc định (port 443)
- Không cần mở port, firewall hay cấu hình mạng
- Chỉ cần biến môi trường đúng

---

## Nếu vẫn lỗi (Application error: server-side exception)

1. **Trang kiểm tra**: Mở `https://dien-phat-frontend.vercel.app/kiem-tra` – xem ping, health, products; biết chính xác lỗi ở đâu
2. **Xem log Vercel**: Deployments > **Logs** hoặc **Functions** > xem lỗi thực tế
3. **Backend ping**: Mở `https://<backend>.vercel.app/api/ping` – trả `{"ok":true}` là backend reachable
4. **API_SERVER_URL**: Bắt buộc trên frontend – đặt `https://<backend-project>.vercel.app/api`
5. **Backend 404 (log thấy /v1/... thay vì /api/v1/...)**: Vercel strip prefix /api. Đã thêm middleware trong backend để chuẩn hóa req.url.
6. **CORS**: `CORS_ORIGIN` trên backend có domain frontend
7. **Timeout**: Server-side fetch timeout 30s (cold start MongoDB có thể chậm)
