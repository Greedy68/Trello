import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
