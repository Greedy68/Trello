import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, TextField } from '@mui/material';
import api from './api';
import List from '../components/List';
import CardModal from '../components/CardModal';

import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export default function Board() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchBoard = async () => {
    try {
      const res = await api.board.getById(id);
      setBoard(res.data);
    } catch (error) { console.error("Lỗi fetch board:", error); }
  };

  const findListId = (id) => {
    if (board.lists.find(l => l.id === id)) return id;
    const list = board.lists.find(l => l.cards.some(c => c.id === id));
    return list ? list.id : null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const list = board.lists.find(l => l.cards.some(c => c.id === active.id));
    const card = list?.cards.find(c => c.id === active.id);
    setActiveCard(card);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findListId(activeId);
    const overContainer = findListId(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setBoard(prev => {
      const activeList = prev.lists.find(l => l.id === activeContainer);
      const activeCardData = activeList.cards.find(c => c.id === activeId);
      return {
        ...prev,
        lists: prev.lists.map(l => {
          if (l.id === activeContainer) return { ...l, cards: l.cards.filter(c => c.id !== activeId) };
          if (l.id === overContainer) return { ...l, cards: [...l.cards, { ...activeCardData, listId: overContainer }] };
          return l;
        })
      };
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) { setActiveCard(null); return; }
    const activeId = active.id;
    const overId = over.id;
    const activeContainer = findListId(activeId);
    const overContainer = findListId(overId);

    if (activeContainer === overContainer) {
      const activeList = board.lists.find(l => l.id === activeContainer);
      const oldIndex = activeList.cards.findIndex(c => c.id === activeId);
      const newIndex = activeList.cards.findIndex(c => c.id === overId);
      if (oldIndex !== newIndex) {
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => l.id === activeContainer
            ? { ...l, cards: arrayMove(l.cards, oldIndex, newIndex) }
            : l
          )
        }));
      }
    }

    try {
      await api.card.update(activeId, { listId: overContainer });
    } catch (err) {
      console.error(err);
      fetchBoard();
    }

    setActiveCard(null);
  };

  const handleCardClick = (card) => { setEditingCard(card); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setEditingCard(null); };

  const handleAddList = async () => {
    if (!newListTitle) return;
    try {
      const res = await api.list.create({ title: newListTitle, boardId: id });
      setBoard({ ...board, lists: [...board.lists, { ...res.data, cards: [] }] });
      setNewListTitle('');
      setIsAddingList(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchBoard(); }, [id]);

  if (!board) return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Đang tải công trình dữ liệu của sếp...</Typography>
    </Box>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'transparent', overflow: 'hidden' }}>

        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', bgcolor: '#0747a6', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" fontWeight="bold">{board.title}</Typography>
        </Box>

        <Box sx={{ p: 2, flexGrow: 1, overflowX: 'auto', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {board.lists.map(list => (
            <List key={list.id} list={list} onUpdate={fetchBoard} onCardClick={handleCardClick} />
          ))}

          {isAddingList ? (
            <Box sx={{ minWidth: 272, p: 1, borderRadius: 1 }} className="glass-list">
              <TextField fullWidth size="small" autoFocus placeholder="Tiêu đề danh sách..." value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} sx={{ bgcolor: 'white', mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" className="add-button" onClick={handleAddList}>Thêm</Button>
                <Button size="small" onClick={() => setIsAddingList(false)}>X</Button>
              </Box>
            </Box>
          ) : (
            <Button onClick={() => setIsAddingList(true)}
              className="add-button"
              sx={{ minWidth: 272, bgcolor: '#ebecf0', color: '#172b4d', justifyContent: 'flex-start', px: 2, '&:hover': { bgcolor: '#e2e4e9' } }}>
              + Thêm danh sách mới
            </Button>
          )}
        </Box>

        <CardModal open={isModalOpen} onClose={handleModalClose} card={editingCard} onUpdate={fetchBoard} />
      </Box>

      <DragOverlay>
        {activeCard ? (
          <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, boxShadow: 10, width: 256, opacity: 0.9, cursor: 'grabbing' }}>
            <Typography variant="body2" fontWeight="500">{activeCard.title}</Typography>
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
