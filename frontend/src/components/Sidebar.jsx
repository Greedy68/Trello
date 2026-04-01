import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Avatar, Menu, MenuItem, Divider, CircularProgress } from '@mui/material';
import api from '../api';

/**
 * SIDEBAR: COMPONENT DÙNG CHUNG XE TOÀN APP
 * Nằm trong MainLayout, luôn tồn tại dù người dùng chuyển trang.
 */
const Sidebar = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null); // Lưu trữ phần tử mỏ neo của Menu Logout
    const navigate = useNavigate();
    const { id: activeBoardId } = useParams(); // LẤY ID TỪ URL ĐỂ ĐÁNH DẤU BOARD ĐANG MỞ
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    /**
     * HÀM fetchBoards: Tải tất cả các Board mà người dùng này sở hữu
     */
    const fetchBoards = async () => {
        try {
            const res = await api.board.getAll();
            setBoards(res.data);
        } catch (err) { console.error("Lỗi fetch sidebar:", err); }
        finally { setLoading(false); }
    };

    // Tải lại danh sách Board khi ID Board trên URL thay đổi
    useEffect(() => { fetchBoards(); }, [activeBoardId]);

    // XỬ LÝ MENU LOGOUT (Tương tác UI)
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    /**
     * HÀM handleLogout: Xoá sạch "vết chân" của User và đá về Login
     */
    const handleLogout = () => { 
        localStorage.clear(); // XOÁ TOKEN VÀ USER INFO
        window.location.href = '/login'; // REFRESH CỨNG ĐỂ RESET TOÀN BỘ APP STATE
    };

    return (
        <Box sx={{
            width: 280,
            height: '100vh',
            bgcolor: '#1a1d23', // MÀU LẠNH SANG TRỌNG
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0
        }}>
            {/* HEADER SIDEBAR: HIỂN THỊ INFO USER & MENU LOGOUT */}
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

            {/* BOX MENU LOGOUT (DROPDOWN) */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleLogout}>Đăng xuất tài khoản</MenuItem>
              <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>Trang chủ</MenuItem>
            </Menu>

            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

            {/* DANH SÁCH CÁC TRƯỜNG BOARDS - KÍCH THƯỚC BẰNG NHAU */}
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
                                // HIỆU ỨNG ACTIVE: NẾU BOARD ID TRÙNG TRÊN URL THÌ LÀM NỔI BẬT
                                color: activeBoardId === board.id ? 'white' : 'rgba(255,255,255,0.7)',
                                bgcolor: activeBoardId === board.id ? 'rgba(0, 121, 191, 0.4)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                width: '100%', // ĐẢM BẢO RỘNG BẰNG NHAU THEO CỘT
                                borderRadius: 2,
                                px: 2,
                                py: 1.5,
                                fontWeight: activeBoardId === board.id ? 'bold' : 'normal'
                            }}
                        >
                            # {board.title}
                        </Button>
                    ))}
                    
                    {/* NÚT THOÁT VỀ HOME ĐỂ TẠO BẢNG MỚI */}
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
