import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, TextField, Button } from '@mui/material';
import api from './api';
import AddIcon from '@mui/icons-material/Add';

export default function Home() {
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleCreateBoard = async () => {
        if (!newBoardTitle) return;
        try {
            const res = await api.board.create({ title: newBoardTitle });
            navigate(`/boards/${res.data.id}`);
        } catch (err) { console.error("Lỗi tạo bảng:", err); }
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <Container maxWidth="sm">
                <Paper
                    elevation={6}
                    sx={{ p: 4, textAlign: 'center', borderRadius: 4, className: 'glass-list' }}
                >
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#172b4d' }}>
                        Chào mừng, {user.name}! 👋
                    </Typography>

                    <Typography variant="body1" sx={{ color: '#5e6c84', mb: 4 }}>
                        Hãy chọn một bảng ở thanh bên trái hoặc tạo một bảng mới ngay bên dưới để bắt đầu công việc.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Tên bảng mới (VD: Dự án SEO, Team Building...)"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            sx={{ bgcolor: 'white', borderRadius: 2 }}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()} 
                        />
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<AddIcon />}
                            onClick={handleCreateBoard}
                            sx={{
                                bgcolor: '#0079bf',
                                py: 1.5,
                                textTransform: 'none',
                                fontWeight: 'bold',
                                borderRadius: 2
                            }}
                        >
                            Tạo bảng mới ngay
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
