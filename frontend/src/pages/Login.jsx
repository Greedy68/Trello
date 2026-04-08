import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Container, Link } from '@mui/material';
import api from './api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ userName: '', password: '', name: '', email: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAction = async () => {
        setError('');
        try {
            const res = isLogin
                ? await api.auth.login(formData)
                : await api.auth.register(formData);

            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/');
            } else {
                alert('Đăng ký thành công! Hãy đăng nhập nhé.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#f4f5f7' }}>
            <Container maxWidth="xs">
                <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>Trello Clone</Typography>
                    <Typography variant="h6" sx={{ mb: 3 }}>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!isLogin && (
                            <TextField label="Họ tên" variant="outlined" fullWidth
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        )}
                        <TextField label="Tên đăng nhập" variant="outlined" fullWidth
                            onChange={(e) => setFormData({ ...formData, userName: e.target.value })} />
                        <TextField label="Mật khẩu" type="password" variant="outlined" fullWidth
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        {error && <Typography color="error" variant="body2">{error}</Typography>}
                        <Button variant="contained" size="large" fullWidth onClick={handleAction}>
                            {isLogin ? 'Vào Trello' : 'Đăng ký ngay'}
                        </Button>
                        <Link href="#" onClick={() => setIsLogin(!isLogin)} sx={{ textDecoration: 'none' }}>
                            {isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
