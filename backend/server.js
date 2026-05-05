import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Server } from 'socket.io';

const redisClient = createClient();
redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = 'your-secret-key';

app.use(cors());
app.use(express.json());


const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('✅ Có kết nối Socket mới: ', socket.id);


  socket.on('join_board', (boardId) => {
    socket.join(`board:${boardId}`);
    console.log(`User ${socket.id} gia nhập phòng Bảng: ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User ngắt kết nối: ', socket.id);
  });
});



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
  try {


    const cachedBoard = await redisClient.get(`board:${req.params.id}`);


    if (cachedBoard) {
      console.log('⚡️ Phản hồi từ Cache siêu tốc!');
      return res.json(JSON.parse(cachedBoard));
    }

    console.log('🐢 Phản hồi từ Database (Rùa)...');

    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: { cards: { orderBy: { position: 'asc' } } }
        }
      }
    });

    if (!board) return res.status(404).json({ error: 'Không tìm thấy bảng' });



    await redisClient.setEx(`board:${req.params.id}`, 3600, JSON.stringify(board));

    res.json(board);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu bảng' });
  }
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


  await redisClient.del(`board:${boardId}`);


  io.to(`board:${boardId}`).emit('board_change', { action: 'LIST_CREATED', payload: { ...list, cards: [] } });

  res.json(list);
});


app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
  try {

    const listToDelete = await prisma.list.findUnique({ where: { id: req.params.id } });

    await prisma.list.delete({ where: { id: req.params.id } });

    if (listToDelete) {

      await redisClient.del(`board:${listToDelete.boardId}`);
    }

    res.json({ message: 'Đã xóa danh sách!' });
  } catch (err) { res.status(400).json({ error: 'Lỗi xoá danh sách!' }); }
});


app.patch('/api/cards/:id', authenticateToken, async (req, res) => {
  try {
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: req.body,
      include: { list: true }
    });


    if (card?.list?.boardId) {
      await redisClient.del(`board:${card.list.boardId}`);


      io.to(`board:${card.list.boardId}`).emit('board_change', { action: 'CARD_UPDATED', payload: card });
    }

    res.json(card);
  } catch (err) { res.status(400).json({ error: 'Lỗi cập nhật thẻ!' }); }
});


app.put('/api/cards/:id/reorder', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { sourceListId, destinationListId, newPosition } = req.body;

  try {
    const cardToMove = await prisma.card.findUnique({ where: { id } });
    if (!cardToMove) return res.status(404).json({ error: 'Không tìm thấy thẻ!' });

    const oldPosition = cardToMove.position;
    const transactions = [];


    if (sourceListId === destinationListId) {
      if (oldPosition === newPosition) return res.json(cardToMove);

      if (newPosition > oldPosition) {

        transactions.push(
          prisma.card.updateMany({
            where: { listId: sourceListId, position: { gt: oldPosition, lte: newPosition } },
            data: { position: { decrement: 1 } },
          })
        );
      } else {

        transactions.push(
          prisma.card.updateMany({
            where: { listId: sourceListId, position: { gte: newPosition, lt: oldPosition } },
            data: { position: { increment: 1 } },
          })
        );
      }
    } else {



      transactions.push(
        prisma.card.updateMany({
          where: { listId: sourceListId, position: { gt: oldPosition } },
          data: { position: { decrement: 1 } },
        })
      );


      transactions.push(
        prisma.card.updateMany({
          where: { listId: destinationListId, position: { gte: newPosition } },
          data: { position: { increment: 1 } },
        })
      );
    }


    transactions.push(
      prisma.card.update({
        where: { id },
        data: { listId: destinationListId, position: newPosition },
      })
    );


    await prisma.$transaction(transactions);



    const destList = await prisma.list.findUnique({ where: { id: destinationListId } });
    if (destList) {
      await redisClient.del(`board:${destList.boardId}`);


      io.to(`board:${destList.boardId}`).emit('board_change', { action: 'REORDER', payload: null });
    }


    const sourceList = await prisma.list.findUnique({ where: { id: sourceListId } });
    if (sourceList && sourceList.boardId !== destList?.boardId) {
      await redisClient.del(`board:${sourceList.boardId}`);
    }

    res.json({ message: 'Đổi vị trí thẻ thành công!' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Lỗi khi sắp xếp thẻ!' });
  }
});


app.post('/api/cards', authenticateToken, async (req, res) => {
  const { title, listId, position } = req.body;
  const card = await prisma.card.create({
    data: { title, listId, position },
    include: { list: true }
  });


  if (card?.list?.boardId) {
    await redisClient.del(`board:${card.list.boardId}`);

    io.to(`board:${card.list.boardId}`).emit('board_change', { action: 'CARD_CREATED', payload: card });
  }

  res.json(card);
});

const PORT = 5002;

httpServer.listen(PORT, () => console.log(`Bệ phóng Backend (Có Socket.io) đang chạy trên cổng ${PORT} 🚀`));
