# Deploy Frontend + Backend trên Vercel

Cả frontend và backend đều deploy trên Vercel, dùng **2 project** cùng repo.

---

## Bước 1: Deploy Backend trước

1. Vercel Dashboard > **Add New** > **Project**
2. Import repo `ThoTP22/dien-phat`
3. Cấu hình:
   - **Name**: `dien-phat-backend`
   - **Root Directory**: `backend`
   - **Framework**: Other
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: (để trống)
4. **Environment Variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `S3_REGION`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
   - `CORS_ORIGIN`: `https://dien-phat-frontend.vercel.app,https://*.vercel.app`
5. Deploy, lấy URL (vd: `https://dien-phat-backend.vercel.app`)

---

## Bước 2: Deploy Frontend

1. **Add New** > **Project** > cùng repo
2. Cấu hình:
   - **Name**: `dien-phat-frontend`
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
3. **Environment Variables**:
   - `API_SERVER_URL`: `https://dien-phat-backend.vercel.app/api` (URL backend từ bước 1)
   - `NEXT_PUBLIC_API_BASE_URL`: `/api`
   - `NEXT_PUBLIC_SITE_URL`: `https://dien-phat-frontend.vercel.app`
   - `NEXT_PUBLIC_HERO_VIDEO_URL`: URL video S3
4. Deploy

---

## Luồng hoạt động

- Client gọi `/api/v1/...` trên domain frontend
- Next.js rewrites proxy sang backend Vercel
- Không cần CORS vì cùng được proxy qua frontend
