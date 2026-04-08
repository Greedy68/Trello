import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Avatar, Menu, MenuItem, Divider, CircularProgress } from '@mui/material';
import api from '../pages/api';

const Sidebar = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const { id: activeBoardId } = useParams();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchBoards = async () => {
        try {
            const res = await api.board.getAll();
            setBoards(res.data);
        } catch (err) { console.error("Lỗi fetch sidebar:", err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBoards(); }, [activeBoardId]);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <Box sx={{
            width: 280,
            height: '100vh',
            bgcolor: '#1a1d23',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0
        }}>
            <Box
                onClick={handleMenuOpen}
                sx={{
                    p: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'white',
                    cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                }}
            >
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>{user.name?.charAt(0)}</Avatar>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1, noWrap: true }}>
                    {user.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.5 }}>▼</Typography>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleLogout}>Đăng xuất tài khoản</MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>Trang chủ</MenuItem>
            </Menu>

            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

            <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', mb: 2, display: 'block' }}>BẢNG CỦA TÔI</Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {loading ? <CircularProgress size={20} /> : boards.map(board => (
                        <Button
                            key={board.id}
                            onClick={() => navigate(`/boards/${board.id}`)}
                            sx={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                textTransform: 'none',
                                color: activeBoardId === board.id ? 'white' : 'rgba(255,255,255,0.7)',
                                bgcolor: activeBoardId === board.id ? 'rgba(0, 121, 191, 0.4)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                width: '100%',
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                fontWeight: activeBoardId === board.id ? 'bold' : 'normal'
                            }}
                        >
                            # {board.title}
                        </Button>
                    ))}

                    <Button
                        onClick={() => navigate('/')}
                        sx={{ color: 'rgba(255,255,255,0.5)', justifyContent: 'flex-start', textTransform: 'none', mt: 1, borderRadius: 2, px: 2 }}
                    >
                        + Tạo bảng mới
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Sidebar;
