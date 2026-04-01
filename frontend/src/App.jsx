import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Board from './pages/Board';
import Login from './pages/Login';
import Home from './pages/Home';
import MainLayout from './components/MainLayout';
import { CssBaseline } from '@mui/material';

// --- BẢO VỆ ĐƯỜNG DẪN CỰC MẠNH ---
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        // Nếu không có Token -> Thẳng về Login
        return <Navigate to="/login" replace />;
    }
    // Ở đây anh bao bọc Layout cho mọi trang bên trong 
    return <MainLayout>{children}</MainLayout>;
};

function App() {
    return (
        <>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    {/* TOÀN BỘ TRANG BÊN DƯỚI ĐỀU SẼ CÓ SIDEBAR VÀ ĐƯỢC BẢO VỆ */}
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/boards/:id" element={<ProtectedRoute><Board /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
