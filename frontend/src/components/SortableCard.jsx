import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '../pages/api';

export default function SortableCard({ card, onClick, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: '8px',
    cursor: 'pointer'
  };

  const handleToggleDone = async (e) => {
    e.stopPropagation();
    try {
      await api.card.update(card.id, { isDone: !card.isDone });

      if (onUpdate) onUpdate();
    } catch (err) { console.error("Lỗi cập nhật trạng thái thẻ:", err); }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(card)}
      className="premium-card"
      sx={{
        p: 1.5,
        bgcolor: card.isDone ? 'rgba(76, 175, 80, 0.05)' : 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        position: 'relative',
        borderRadius: '8px'
      }}
    >
      <Box
        onClick={(e) => {
          e.stopPropagation();
          handleToggleDone(e);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{
          display: 'flex',
          alignItems: 'center',
          zIndex: 10,
          position: 'relative'
        }}
      >
        {card.isDone ? (
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 24 }} />
        ) : (
          <RadioButtonUncheckedIcon sx={{ color: '#ddd', fontSize: 24, '&:hover': { color: '#bbb' } }} />
        )}
      </Box>

      <Typography
        variant="body2"
        sx={{
          flexGrow: 1,
          color: card.isDone ? '#999' : '#172b4d',
          textDecoration: card.isDone ? 'line-through' : 'none',
          fontWeight: card.isDone ? 'normal' : '500'
        }}
      >
        {card.title}
      </Typography>
    </Paper>
  );
}
