import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../pages/api';

export default function CardModal({ open, onClose, card, onUpdate }) {
  // 1. Khởi tạo state cục bộ để người dùng nhập liệu
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 2. Mỗi khi "card" truyền từ Board thay đổi, mình phải cập nhật lại state ở đây
  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
    }
  }, [card]);

  // 3. Hàm xử lý khi nhấn Lưu
  const handleSave = async () => {
    try {
      await api.card.update(card.id, { title, description });
      onUpdate(); // Gọi hàm của Board để load lại dữ liệu mới nhất
      onClose();  // Đóng Modal
    } catch (err) {
      console.error('Lỗi cập nhật thẻ:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Sửa thông tin Thẻ
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Tiêu đề"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Mô tả chi tiết"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả ở đây..."
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pb: 2 }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button variant="contained" onClick={handleSave}>Lưu lại</Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
