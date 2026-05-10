# Dien Phat - Website bán hàng và quản lý dịch vụ

Hệ thống website thương mại điện tử và quản trị nội bộ dành cho cửa hàng thiết bị điện tử Điện Phát. Bao gồm trang khách hàng, trang quản trị admin, cổng kỹ thuật viên và chatbot AI hỗ trợ.

---

## Tổng quan

Dự án được chia thành hai phần chính:

- **Backend**: REST API xây dựng bằng Express + TypeScript + MongoDB
- **Frontend**: Giao diện web xây dựng bằng Next.js 16 (App Router) + Tailwind CSS + shadcn/ui

---

## Tính năng chính

### Phía khách hàng
- Xem danh mục và sản phẩm, lọc và tìm kiếm
- Xem thông tin showroom, bài viết tin tức
- Đăng ký tư vấn (lead)
- Chatbot AI hỗ trợ tư vấn sản phẩm và dịch vụ (Gemini)

### Phía admin
- Quản lý danh mục, sản phẩm, bài viết, cài đặt showroom
- Quản lý leads và phiếu sửa chữa (bảo hành)
- Quản lý tài khoản người dùng và kỹ thuật viên
- Chatbot AI nội bộ có quyền tra cứu và cập nhật dữ liệu
- Trang tổng quan thống kê theo thời gian thực

### Phía kỹ thuật viên
- Đăng nhập bằng tài khoản riêng
- Xem và cập nhật trạng thái phiếu sửa chữa được phân công

---

## Công nghệ sử dụng

### Backend
| Thành phần | Công nghệ |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Xác thực | JWT (jsonwebtoken) |
| Lưu trữ file | AWS S3 |
| AI | Google Gemini API |
| Validation | Zod |

### Frontend
| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Editor | Tiptap |
| HTTP client | Axios |
| Upload | Rpldy |

---

## Cài đặt và chạy dự án

### Yêu cầu
- Node.js >= 18
- MongoDB (local hoặc Atlas)
- AWS S3 bucket (cho upload ảnh)
- Google Gemini API key

### Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/dien-phat
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

S3_REGION=ap-southeast-1
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key

GEMINI_API_KEY=your-gemini-api-key
```

Chạy development:

```bash
npm run dev
```

Build và chạy production:

```bash
npm run build
npm start
```

Seed dữ liệu mẫu:

```bash
npm run seed:admin       # Tạo tài khoản admin mặc định
npm run seed:products    # Tạo sản phẩm mẫu
npm run reset:admin      # Reset mật khẩu admin
```

### Frontend

```bash
cd frontend
npm install
```

Tạo file `.env.local` trong thư mục `frontend/`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Chạy development:

```bash
npm run dev
```

Build và chạy production:

```bash
npm run build
npm start
```

---

## Cấu trúc thư mục

```
dien-phat/
├── backend/
│   └── src/
│       ├── chat/          # Khai báo và xử lý tool Gemini
│       ├── configs/       # Cấu hình database, env, S3
│       ├── controllers/   # Request handlers
│       ├── middlewares/   # Auth, rate limit, validate, upload
│       ├── models/        # Mongoose models
│       ├── repositories/  # Tầng truy vấn database
│       ├── services/      # Business logic
│       ├── validators/    # Zod schema validation
│       └── script/        # Seed và utility scripts
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── admin/     # Trang quản trị admin
│       │   ├── technician/# Cổng kỹ thuật viên
│       │   └── (public)   # Trang khách hàng
│       ├── components/    # UI components dùng chung
│       ├── services/      # Gọi API từ frontend
│       └── lib/           # Utilities, http client
└── infra/                 # Docker, Terraform, deploy scripts
```

---

## API

Backend phục vụ tại `http://localhost:4000/api/v1`.

Các nhóm endpoint chính:

| Nhóm | Prefix |
|---|---|
| Xác thực | `/v1/auth` |
| Sản phẩm | `/v1/products` |
| Danh mục | `/v1/categories` |
| Bài viết | `/v1/posts` |
| Showroom | `/v1/showroom` |
| Leads | `/v1/leads` |
| Phiếu sửa chữa | `/v1/repair-tickets` |
| Người dùng | `/v1/users` |
| Upload | `/v1/upload` |
| Chat (public) | `/v1/chat` |
| Chat (admin) | `/v1/admin/chat` |

Tất cả response trả về dạng:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

---

## Deploy

Xem hướng dẫn chi tiết trong thư mục `docs/`:

- `docs/DEPLOY-BACKEND-RENDER.md` — Deploy backend lên Render
- `docs/DEPLOY-VERCEL-ALL.md` — Deploy toàn bộ lên Vercel
- `infra/DEPLOY-GUIDE.md` — Deploy bằng Docker + Terraform (AWS EC2)

---

## License

MIT