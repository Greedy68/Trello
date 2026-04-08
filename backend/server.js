import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Truy cập bị từ chối!' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ!' });
    req.user = user;
    next();
  });
};

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

app.post('/api/auth/login', async (req, res) => {
  const { userName, password } = req.body;
  const user = await prisma.user.findUnique({ where: { userName } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không đúng!' });
  }
  const token = jwt.sign({ id: user.id, userName: user.userName }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, userName: user.userName } });
});

app.get('/api/boards', authenticateToken, async (req, res) => {
  const boards = await prisma.board.findMany({ where: { userId: req.user.id } });
  res.json(boards);
});

app.get('/api/boards/:id', authenticateToken, async (req, res) => {
  const board = await prisma.board.findUnique({
    where: { id: req.params.id },
    include: {
      lists: {
        orderBy: { position: 'asc' },
        include: { cards: { orderBy: { position: 'asc' } } }
      }
    }
  });
  res.json(board);
});

app.post('/api/boards', authenticateToken, async (req, res) => {
  const { title } = req.body;
  try {
    const board = await prisma.board.create({
      data: {
        title,
        userId: req.user.id
      }
    });
    res.json(board);
  } catch (err) { res.status(400).json({ error: 'Lỗi tạo bảng!' }); }
});

app.post('/api/lists', authenticateToken, async (req, res) => {
  const { title, boardId } = req.body;
  const list = await prisma.list.create({ data: { title, boardId } });
  res.json(list);
});

app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    res.json({ message: 'Đã xóa danh sách!' });
  } catch (err) { res.status(400).json({ error: 'Lỗi xoá danh sách!' }); }
});

app.patch('/api/cards/:id', authenticateToken, async (req, res) => {
  try {
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(card);
  } catch (err) { res.status(400).json({ error: 'Lỗi cập nhật thẻ!' }); }
});

app.post('/api/cards', authenticateToken, async (req, res) => {
  const { title, listId, position } = req.body;
  const card = await prisma.card.create({ data: { title, listId, position } });
  res.json(card);
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Bệ phóng Backend đang chạy trên cổng ${PORT} 🚀`));
