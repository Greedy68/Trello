import { useState } from 'react';
import { Paper, Typography, Box, IconButton, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';
import SortableCard from './SortableCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

/**
 * COMPONENT CỘT (LIST): DANH SÁCH CHỨA CÁC THÀNH VIÊN CARD
 * Hỗ trợ làm "Thùng chứa" (Droppable) để nhận các thẻ kéo tới.
 */
export default function List({ list, onUpdate, onCardClick }) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewListTitle] = useState('');

  // SỬ DỤNG useDroppable: Để cái Cột này có thể nhận diện các thẻ thả vào (Ngay cả khi cột rỗng)
  const { setNodeRef } = useDroppable({ id: list.id });

  /**
   * HÀM handleAddCard: Thêm một thẻ mới vào đúng vị trí cuối cùng của Cột này.
   */
  const handleAddCard = async () => {
    if (!newCardTitle) return;
    try {
      // TRUYỀN DATA DƯỚI DẠNG OBJECT { title, listId, position }
      await api.card.create({ 
        title: newCardTitle, 
        listId: list.id, 
        position: list.cards.length + 1 // ĐỂ THẺ MỚI LUÔN NẰM CUỐI
      });
      setNewListTitle('');
      setIsAddingCard(false);
      onUpdate(); // Gọi callback để refresh toàn bộ Board
    } catch (err) { console.error('Lỗi thêm thẻ:', err); }
  };

  /**
   * HÀM handleDeleteList: Xoá bỏ vĩnh viễn cả một Cột dữ liệu.
   */
  const handleDeleteList = async () => {
    if (window.confirm(`Xóa danh sách: ${list.title}?`)) {
      try {
        await api.list.delete(list.id);
        onUpdate(); // Gọi callback tải lại dữ liệu mới từ Board
      } catch (err) { console.error("Lỗi xoá danh sách:", err); }
    }
  };

  return (
    <Paper
      ref={setNodeRef} // GẮN REF CHỈ ĐỊNH ĐÂY LÀ DROPPABLE TARGET CHO DND-KIT
      className="glass-list"
      sx={{ 
        width: 272, 
        maxHeight: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden', 
        border: '1px solid #ddd',
        borderRadius: '12px'
      }}
    >
      {/* ĐẦU CỘT - MÀU LẠNH TƯƠNG PHẢN (NAVY SLATE) */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: '#2c3e50', // MÀU XANH XÁM ĐẬM
        color: 'white',
        p: 1.5,
        mb: 1
      }}>
        <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase">
          {list.title}
        </Typography>
        <IconButton size="small" onClick={handleDeleteList} sx={{ color: 'white' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* VÙNG CHỨA CÁC THẺ SẮP XẾP ĐƯỢC (SORTABLE CONTEXT) */}
      <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        
        {/* Box này có minHeight: 100 ĐỂ CỘT TRỐNG VẪN LÀ MỤC TIÊU THẢ DỄ DÀNG */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, minHeight: 100 }}>
          {list.cards.map(card => (
            <SortableCard key={card.id} card={card} onClick={onCardClick} onUpdate={onUpdate} />
          ))}

          {/* Ô NHẬP LIỆU THÊM THẺ NHANH */}
          {isAddingCard ? (
            <Box sx={{ px: 0.5 }}>
              <TextField fullWidth multiline rows={2} size="small" autoFocus placeholder="Tiêu đề thẻ nội bộ..." value={newCardTitle} onChange={(e) => setNewListTitle(e.target.value)} sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" className="add-button" onClick={handleAddCard}>Thêm</Button>
                <Button size="small" onClick={() => setIsAddingCard(false)}>X</Button>
              </Box>
            </Box>
          ) : (
            <Button fullWidth onClick={() => setIsAddingCard(true)}
              sx={{ 
                justifyContent: 'flex-start', 
                color: '#5e6c84', 
                textTransform: 'none', 
                mt: 1,
                borderRadius: 1.5,
                '&:hover': { bgcolor: 'rgba(9, 30, 66, 0.08)' } 
              }}>
              + Thêm thẻ
            </Button>
          )}
        </Box>
      </SortableContext>
    </Paper>
  );
}
