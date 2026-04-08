import { useState } from 'react';
import { Paper, Typography, Box, IconButton, Button, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../pages/api';
import SortableCard from './SortableCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

export default function List({ list, onUpdate, onCardClick }) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewListTitle] = useState('');

  const { setNodeRef } = useDroppable({ id: list.id });

  const handleAddCard = async () => {
    if (!newCardTitle) return;
    try {
      await api.card.create({
        title: newCardTitle,
        listId: list.id,
        position: list.cards.length + 1
      });
      setNewListTitle('');
      setIsAddingCard(false);
      onUpdate();
    } catch (err) { console.error('Lỗi thêm thẻ:', err); }
  };

  const handleDeleteList = async () => {
    if (window.confirm(`Xóa danh sách: ${list.title}?`)) {
      try {
        await api.list.delete(list.id);
        onUpdate();
      } catch (err) { console.error("Lỗi xoá danh sách:", err); }
    }
  };

  return (
    <Paper
      ref={setNodeRef}
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: '#2c3e50',
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

      <SortableContext items={list.cards.map(c => c.id)} strategy={verticalListSortingStrategy}>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, minHeight: 100 }}>
          {list.cards.map(card => (
            <SortableCard key={card.id} card={card} onClick={onCardClick} onUpdate={onUpdate} />
          ))}

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
