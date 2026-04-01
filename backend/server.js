const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = 'your-secret-key'; // TÍNH BẢO MẬT: NÊN ĐỂ TRONG .ENV Ở MÔI TRƯỜNG PROD

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE XÁC THỰC (AUTHENTICATION GATEKEEPER) ---
// CHẶN MỌI YÊU CẦU KHÔNG CÓ TOKEN HỢP LỆ
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Truy cập bị từ chối!' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ!' });
    req.user = user; // LƯU THÔNG TIN USER VÀO REQUEST ĐỂ CÁC ROUTE TIẾP THEO SỬ DỤNG
    next();
  });
};

/* --- ĐỘI QUÂN AUTH: ĐĂNG KÝ & ĐĂNG NHẬP --- */

// ĐĂNG KÝ: MÃ HOÁ MẬT KHẨU BẰNG BCRYPT TRƯỚC KHI LƯU
app.post('/api/auth/register', async (req, res) => {
  const { userName, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { userName, password: hashedPassword, name }
    });
    res.json({ message: 'Đăng ký thành công!' });
  } catch (err) { res.status(400).json({ error: 'Tên đăng nhập đã tồn tại!' }); }
});

// ĐĂNG NHẬP: SO KHỚP MẬT KHẨU VÀ PHÁT HÀNH JWT TOKEN
app.post('/api/auth/login', async (req, res) => {
  const { userName, password } = req.body;
  const user = await prisma.user.findUnique({ where: { userName } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không đúng!' });
  }
  const token = jwt.sign({ id: user.id, userName: user.userName }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, userName: user.userName } });
});

/* --- ĐỘI QUÂN BOARD: QUẢN LÝ BẢNG CÔNG VIỆC --- */

// LẤY TOÀN BỘ BOARDS THEO USER ID
app.get('/api/boards', authenticateToken, async (req, res) => {
  const boards = await prisma.board.findMany({ where: { userId: req.user.id } });
  res.json(boards);
});

// LẤY CHI TIẾT 1 BOARD KÈM THEO TẤT CẢ LIST VÀ CARD BÊN TRONG (DEEP QUERY)
app.get('/api/boards/:id', authenticateToken, async (req, res) => {
  const board = await prisma.board.findUnique({
    where: { id: req.params.id },
    include: {
      lists: {
        orderBy: { position: 'asc' }, // SẮP XẾP CỘT THEO THỨ TỰ CỦA NGƯỜI DÙNG
        include: { cards: { orderBy: { position: 'asc' } } } // SẮP XẾP THẺ THEO VỊ TRÍ
      }
    }
  });
  res.json(board);
});

// TẠO BOARD MỚI: TỰ ĐỘNG GÁN QUYỀN CHO USER ĐANG ĐĂNG NHẬP
app.post('/api/boards', authenticateToken, async (req, res) => {
  const { title } = req.body;
  try {
    const board = await prisma.board.create({
      data: { 
        title, 
        userId: req.user.id // BẢO MẬT: GÁN BOARD CHO CHỦ NHÂN ĐÍCH THỰC
      }
    });
    res.json(board);
  } catch (err) { res.status(400).json({ error: 'Lỗi tạo bảng!' }); }
});

/* --- ĐỘI QUÂN LIST & CARD: CÁC THAO TÁC CƠ BẢN (CRUD) --- */

// TẠO CỘT MỚI: LIÊN KẾT VỚI BOARD HIỆN TẠI
app.post('/api/lists', authenticateToken, async (req, res) => {
  const { title, boardId } = req.body;
  const list = await prisma.list.create({ data: { title, boardId } });
  res.json(list);
});

// XOÁ CỘT: PRISMA SẼ TỰ ĐỘNG XOÁ CẢ CARD BÊN TRONG NHỜ CẤU HÌNH CASCADE Ở SCHEMA
app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    res.json({ message: 'Đã xóa danh sách!' });
  } catch (err) { res.status(400).json({ error: 'Lỗi xoá danh sách!' }); }
});

// CẬP NHẬT THẺ: HỖ TRỢ ĐỔI VỊ TRÍ, ĐỔI CỘT, ĐỔI TRẠNG THÁI HOÀN THÀNH (isDone)
app.patch('/api/cards/:id', authenticateToken, async (req, res) => {
  try {
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: req.body // DÙNG REQ.BODY ĐỂ LINH HOẠT CẬP NHẬT BẤT KỲ TRƯỜNG NÀO (isDone, title...)
    });
    res.json(card);
  } catch (err) { res.status(400).json({ error: 'Lỗi cập nhật thẻ!' }); }
});

// TẠO THẺ MỚI
app.post('/api/cards', authenticateToken, async (req, res) => {
  const { title, listId, position } = req.body;
  const card = await prisma.card.create({ data: { title, listId, position } });
  res.json(card);
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Bệ phóng Backend đang chạy trên cổng ${PORT} 🚀`));
