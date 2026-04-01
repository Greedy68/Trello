import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper, TextField, Button } from '@mui/material';
import api from '../api';
import AddIcon from '@mui/icons-material/Add';

/**
 * COMPONENT HOME: TRANG CHÀO MỪNG CỦA HỆ THỐNG
 * Nơi người dùng thực hiện tạo Dự án/Bảng (Board) mới để bắt đầu.
 */
export default function Home() {
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    /**
     * HÀM handleCreateBoard: Gửi yêu cầu tạo Board mới lên Server
     * Sau khi tạo thành công, điều hướng (Navigate) thẳng vào trang Board đó.
     */
    const handleCreateBoard = async () => {
        if (!newBoardTitle) return;
        try {
            // TRUYỀN DATA DƯỚI DẠNG OBJECT { title: '...' } ĐÃ ĐƯỢC CHUẨN HOÁ Ở API.JS
            const res = await api.board.create({ title: newBoardTitle });
            
            // ĐIỀU HƯỚNG SANG TRANG BOARD MỚI - PATH CHUẨN LÀ /BOARDS/:ID
            navigate(`/boards/${res.data.id}`);
            
            // CHÚ Ý: KHÔNG CẦN window.location.reload() VÌ SIDEBAR Ở MAINLAYOUT 
            // TỰ ĐỘNG TRACKING PATH CHAY ĐỂ CẬP NHẬT LẠI DANH SÁCH.
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
                    {/* HIỂN THỊ THÔNG TIN USER TỪ LOCALSTORAGE */}
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#172b4d' }}>
                        Chào mừng, {user.name}! 👋
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: '#5e6c84', mb: 4 }}>
                        Hãy chọn một bảng ở thanh bên trái hoặc tạo một bảng mới ngay bên dưới để bắt đầu công việc.
                    </Typography>

                    {/* FORM TẠO BẢNG NHANH */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Tên bảng mới (VD: Dự án SEO, Team Building...)"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            sx={{ bgcolor: 'white', borderRadius: 2 }}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()} // TẠO KHI NHẤN ENTER
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
