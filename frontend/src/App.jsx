import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Board from './pages/Board';
import Login from './pages/Login';
import Home from './pages/Home';
import MainLayout from './components/MainLayout';
import { CssBaseline } from '@mui/material';


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {

        return <Navigate to="/login" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
};

function App() {
    return (
        <>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />


                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/boards/:id" element={<ProtectedRoute><Board /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
