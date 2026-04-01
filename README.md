# 🛡️ TRELLO CLONE (FULLSTACK MONOREPO) 🚀

Chào mừng bạn đến với dự án **Trello Clone** - bản sao của hệ thống quản lý công việc hàng đầu, được xây dựng với kiến trúc hiện đại, tập trung vào trải nghiệm người dùng kéo thả mượt mà và giao diện Premium.

---

## 🔥 ĐIỂM NHẤN KỸ THUẬT (HIGHLIGHTS)
Đây không chỉ là một ứng dụng CRUD thông thường. Dự án này phô diễn các kỹ năng Fullstack bậc cao:
- **Kéo thả Phức tạp (Complex Dnd)**: Tích hợp `@dnd-kit` cho phép sắp xếp lại thẻ trong cùng một cột hoặc chuyển đổi chéo giữa các cột (Cross-column Drag and Drop).
- **Optimistic UI Update**: Giao diện được cập nhật tức thì (ngay cả trước khi API xác nhận), mang lại cảm giác cực kỳ mượt mà.
- **Kiến trúc Monorepo**: Quản lý cả Frontend và Backend trong cùng một kho lưu trữ tập trung, đảm bảo tính đồng nhất về mặt lịch sử phát triển.
- **Glassmorphism & Split-view Layout**: Giao diện Chia đôi chuyên nghiệp với các hiệu ứng kính mờ (Blur) và độ tương phản cao, tông màu Lạnh (Cool tones) sang trọng.

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)
- **Frontend**: React (Vite), Material UI (MUI), dnd-kit, Axios, React Router v6.
- **Backend**: Node.js, Express, Prisma ORM (Object-Relational Mapping).
- **Database**: PostgreSQL (Neon Serverless Postgres).
- **Auth**: JSON Web Tokens (JWT) & Bcryptjs.

---

## 📁 CẤU TRÚC THƯ MỤC
```text
/trello-clone
  ├── frontend/       # Giao diện React (Vite)
  ├── backend/        # Hệ thống API (Node + Express)
  └── .gitignore      # Hàng rào bảo vệ Monorepo
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT NHANH (QUICK START)

### 1. Chuẩn bị Backend
- Vào thư mục `backend/`
- Cài đặt thư viện: `npm install`
- Thiết lập file `.env` (Chứa DATABASE_URL từ Neon)
- Đẩy Schema vào Database: `npx prisma db push`
- Chạy Server: `npm run dev` (Mặc định: Port 5002)

### 2. Chuẩn bị Frontend
- Vào thư mục `frontend/`
- Cài đặt thư viện: `npm install`
- Chạy Giao diện: `npm run dev` (Mặc định: Port 5173)

---

## 🛡️ TÁC GIẢ & LIÊN HỆ
Dự án được xây dựng với sự hướng dẫn của **Senior AI Assistant**. Hy vọng dự án này sẽ giúp ích cho khâu tuyển dụng của bạn!

*Chúc các bảng Trello luôn tràn ngập màu xanh (Done)!* 🗡️🏁🚀
