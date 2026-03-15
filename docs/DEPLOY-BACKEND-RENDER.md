# Deploy Backend lên Render

Hướng dẫn triển khai backend Express (Gold Shop Midea) lên [Render](https://render.com).

---

## Bước 1: Tạo Web Service

1. Đăng nhập [Render](https://render.com)
2. **New** > **Web Service**
3. Kết nối GitHub (nếu chưa): **Connect account** > chọn repo `ThoTP22/dien-phat`

---

## Bước 2: Cấu hình Build & Deploy

| Trường | Giá trị |
|--------|---------|
| **Name** | `gold-shop-backend` (hoặc tên bạn chọn) |
| **Region** | Singapore (gần VN) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (hoặc Starter nếu cần luôn chạy) |

**Lưu ý**: Free tier sẽ sleep sau 15 phút không có request. Request đầu tiên sau khi sleep có thể mất 30–60 giây để wake up.

---

## Bước 3: Environment Variables

Vào **Environment** tab, thêm các biến:

| Key | Value | Bắt buộc |
|-----|-------|----------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net` | Có |
| `JWT_SECRET` | Chuỗi bí mật ngẫu nhiên (vd: `openssl rand -hex 32`) | Có |
| `S3_REGION` | `ap-southeast-1` | Có |
| `S3_BUCKET_NAME` | `gold-shop-midea` | Có |
| `S3_ACCESS_KEY_ID` | AWS Access Key | Có |
| `S3_SECRET_ACCESS_KEY` | AWS Secret Key | Có |
| `CORS_ORIGIN` | `https://mideadienphat.shop,https://*.vercel.app` | Có |
| `JWT_EXPIRES_IN` | `1d` (tùy chọn) | Không |
| `PORT` | Render tự set, không cần thêm | - |

**Không** commit file `.env` lên git. Chỉ cấu hình trên Render Dashboard.

---

## Bước 4: Deploy

1. Bấm **Create Web Service**
2. Render sẽ build và deploy. Xem log tại **Logs** tab
3. Khi xong, lấy URL dạng: `https://gold-shop-backend-xxxx.onrender.com`

---

## Bước 5: Kiểm tra

```bash
curl https://YOUR_SERVICE.onrender.com/api/health
```

Kết quả mong đợi:
```json
{"success":true,"message":"API khỏe","data":{"uptime":123.45}}
```

---

## Bước 6: Cập nhật Frontend (Vercel)

Thêm/cập nhật trên Vercel:

| Biến | Giá trị |
|------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://gold-shop-backend-xxxx.onrender.com/api` |
| `API_SERVER_URL` | `https://gold-shop-backend-xxxx.onrender.com/api` |

Redeploy frontend để áp dụng.

---

## Cấu trúc URL API

Backend chạy tại gốc, các route có prefix `/api`:

- Health: `GET /api/health`
- Auth: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, ...
- Products: `GET /api/v1/products`, ...
- Categories: `GET /api/v1/categories`, ...

Frontend gọi `NEXT_PUBLIC_API_BASE_URL` + endpoint (vd: `/v1/products`) nên cần base URL kết thúc bằng `/api`.

---

## Xử lý lỗi thường gặp

### Build fail: `tsc` not found
- Đảm bảo `typescript` trong `dependencies` hoặc `devDependencies` (Render cài cả devDependencies khi build)

### Application failed to start
- Kiểm tra `PORT`: Render set sẵn, backend dùng `process.env.PORT`
- Xem **Logs** để biết lỗi cụ thể

### CORS error từ frontend
- Thêm đúng domain Vercel vào `CORS_ORIGIN`
- Dùng `https://*.vercel.app` cho preview deployments

### Request chậm lần đầu
- Free tier sleep sau 15 phút. Request đầu wake up ~30–60s
- Nâng cấp Starter ($7/tháng) để luôn chạy

---

## render.yaml (tùy chọn)

Có thể dùng file cấu hình để deploy:

```yaml
# render.yaml (đặt tại thư mục gốc repo)
services:
  - type: web
    name: gold-shop-backend
    runtime: node
    rootDir: backend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: S3_REGION
        sync: false
      # ... các biến khác cấu hình trên Dashboard
```

Các biến nhạy cảm vẫn nên cấu hình thủ công trên Dashboard.
