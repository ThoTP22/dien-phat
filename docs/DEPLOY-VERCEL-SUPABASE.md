# Deploy Gold Shop Midea: Frontend Vercel + Backend Supabase

Hướng dẫn deploy theo kế hoạch mới:
- **Frontend**: Vercel (Next.js)
- **Backend**: Supabase (PostgreSQL + Edge Functions hoặc Railway/Render)

---

## Lưu ý quan trọng về Supabase

**Supabase không host trực tiếp ứng dụng Node.js/Express.** Supabase cung cấp:
- PostgreSQL database
- Auth, Storage, Realtime
- Edge Functions (Deno/TypeScript)

Backend hiện tại dùng **Express + MongoDB + S3**. Có 2 hướng:

| Phương án | Mô tả | Độ phức tạp |
|-----------|-------|-------------|
| **A** | Deploy backend Express lên **Railway** hoặc **Render**, dùng **Supabase PostgreSQL** thay MongoDB | Trung bình (migrate DB) |
| **B** | Viết lại API thành **Supabase Edge Functions** (Deno) | Cao (rewrite toàn bộ) |

---

## Phần 1: Deploy Frontend lên Vercel

### 1.1 Chuẩn bị

1. Tạo tài khoản [Vercel](https://vercel.com)
2. Cài [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
3. Push code lên GitHub (nếu chưa có)

### 1.2 Deploy qua Vercel Dashboard

1. Vào [vercel.com/new](https://vercel.com/new)
2. Import repository GitHub
3. Cấu hình:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (tự nhận)
   - **Build Command**: `npm run build`
   - **Output Directory**: (để mặc định)

4. Thêm Environment Variables:

| Biến | Giá trị | Ghi chú |
|------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://YOUR_BACKEND_URL/api` | URL backend (Railway/Supabase Edge) |
| `NEXT_PUBLIC_SITE_URL` | `https://mideadienphat.shop` | Domain production |
| `API_SERVER_URL` | `https://YOUR_BACKEND_URL/api` | Dùng cho server-side fetch |

5. Deploy

### 1.3 Deploy qua CLI

```bash
cd frontend
vercel
# Lần đầu: đăng nhập, chọn project
# Thêm env: vercel env add NEXT_PUBLIC_API_BASE_URL
```

### 1.4 Trỏ domain

1. Vercel Dashboard > Project > Settings > Domains
2. Thêm `mideadienphat.shop`
3. Cập nhật DNS tại Hostinger: thêm CNAME trỏ tới `cname.vercel-dns.com`

---

## Phần 2: Backend - Phương án A (Khuyến nghị)

Deploy Express lên **Railway** hoặc **Render**, dùng **Supabase PostgreSQL** thay MongoDB.

### 2.1 Supabase - Tạo project và database

1. Tạo project tại [supabase.com](https://supabase.com)
2. Lấy **Connection string** (URI) từ Settings > Database
3. Migrate schema MongoDB sang PostgreSQL (cần viết script migration)

### 2.2 Deploy backend lên Railway

1. Tạo tài khoản [Railway](https://railway.app)
2. New Project > Deploy from GitHub
3. Chọn repo, set **Root Directory**: `backend`
4. Railway tự nhận Node.js, build `npm run build`, start `npm start`
5. Thêm biến môi trường:
   - `PORT` (Railway tự set)
   - `MONGODB_URI` hoặc `DATABASE_URL` (Supabase PostgreSQL URI nếu đã migrate)
   - `JWT_SECRET`
   - `S3_*` hoặc chuyển sang Supabase Storage
   - `CORS_ORIGIN`: `https://mideadienphat.shop,https://*.vercel.app`
6. Lấy URL deploy (vd: `https://xxx.railway.app`)

### 2.3 Deploy backend lên Render

1. Tạo tài khoản [Render](https://render.com)
2. New > Web Service
3. Connect GitHub, chọn repo, **Root Directory**: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Thêm env vars tương tự Railway
7. Lấy URL (vd: `https://xxx.onrender.com`)

### 2.4 Cập nhật CORS backend

Trong `backend/.env` hoặc biến môi trường trên Railway/Render:

```
CORS_ORIGIN=https://mideadienphat.shop,https://*.vercel.app
```

Backend đã hỗ trợ wildcard `*.vercel.app` cho preview deployments.

---

## Phần 3: Backend - Phương án B (Supabase Edge Functions)

Viết lại API thành Supabase Edge Functions (Deno). Mỗi route tương ứng 1 function hoặc dùng Oak router.

### 3.1 Cài Supabase CLI

```bash
npm i -g supabase
supabase login
```

### 3.2 Khởi tạo project

```bash
cd backend
supabase init
```

### 3.3 Cấu trúc Edge Functions

```
supabase/
  functions/
    api/
      index.ts    # Router chính, forward tới các handler
    auth-login/
      index.ts
    categories/
      index.ts
    ...
```

### 3.4 Ví dụ Edge Function (Deno)

```typescript
// supabase/functions/api/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  // Route handling...
  return new Response(JSON.stringify({ data: [] }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### 3.5 Deploy Edge Functions

```bash
supabase functions deploy api --project-ref YOUR_PROJECT_REF
```

URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/api`

**Lưu ý**: Phương án B đòi hỏi viết lại toàn bộ logic từ Express/Mongoose sang Deno + Supabase client. Ước lượng công sức lớn.

---

## Phần 4: Supabase Storage (thay S3)

Nếu dùng Supabase, có thể chuyển upload ảnh sang Supabase Storage:

1. Tạo bucket `images` trong Supabase Dashboard
2. Cấu hình policy public read
3. Sửa `backend` dùng `@supabase/supabase-js` thay `@aws-sdk/client-s3`

---

## Tóm tắt nhanh

| Bước | Hành động |
|------|-----------|
| 1 | Deploy frontend lên Vercel (root: `frontend`) |
| 2 | Deploy backend lên Railway hoặc Render |
| 3 | Cập nhật `NEXT_PUBLIC_API_BASE_URL` và `API_SERVER_URL` trên Vercel = URL backend |
| 4 | Cập nhật `CORS_ORIGIN` trên backend = domain Vercel |
| 5 | (Tùy chọn) Migrate MongoDB sang Supabase PostgreSQL |
| 6 | (Tùy chọn) Chuyển S3 sang Supabase Storage |

---

## File đã tạo/cập nhật

- `frontend/vercel.json` - Cấu hình Vercel
- `frontend/.env.example` - Mẫu biến môi trường cho production
- `frontend/next.config.ts` - Tắt `output: standalone` khi build trên Vercel
