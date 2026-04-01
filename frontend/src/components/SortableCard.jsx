import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '../api';

/**
 * COMPONENT THẺ THÔNG MINH (CARD)
 * Hỗ trợ kéo thả (Sortable), Đánh dấu hoàn thành (isDone) và Mở chi tiết.
 */
export default function SortableCard({ card, onClick, onUpdate }) {
    // KÍN ĐÁO SỬ DỤNG useSortable: KHAI BÁO CỘT THẺ CHO DND-KIT
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card.id
    });

    // CẤU HÌNH STYLE KHI KÉO: Chuyển đổi tọa độ thành thuộc tính transform CSS
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // GIẢM ĐẬM NHẠT KHI ĐANG KÉO GIÚP NHẬN DIỆN "HỐ" TRỐNG
        marginBottom: '8px',
        cursor: 'pointer'
    };

    /**
     * HÀM handleToggleDone: Xử lý bật/tắt (Toggle) trạng thái hoàn thành (isDone).
     * Ghi đè trạng thái và gọi API PATCH /cards/:id.
     */
    const handleToggleDone = async (e) => {
        // NGĂN SỰ KIỆN LAN TRUYỀN: Click vào ô tick thì KHÔNG được mở modal chi tiết card
        e.stopPropagation(); 
        try {
            // GỬI DATA DẠNG OBJECT !isDone (ĐẢO TRẠNG THÁI)
            await api.card.update(card.id, { isDone: !card.isDone });
            
            // SPA SMOOTH UPDATE: Gọi callback từ Board để fetch lại dữ liệu êm ái
            if (onUpdate) onUpdate(); 
        } catch (err) { console.error("Lỗi cập nhật trạng thái thẻ:", err); }
    };

    return (
        <Paper
            ref={setNodeRef} // CHỈ ĐỊNH ĐÂY LÀ PHẦN TỬ DND-KIT CÓ THỂ QUẢN LÝ
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(card)} // MỞ MODAL KHI CLICK VÀO CÁC PHẦN CÒN LẠI CỦA THẺ
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
            {/* BOX ICON TICK XANH - ĐÃ GIẢI PHÓNG KHỎI KÉO THẢ BẰNG e.stopPropagation() */}
            <Box 
              onClick={(e) => {
                e.stopPropagation(); // KHÔNG CHO MỞ MODAL
                handleToggleDone(e);
              }} 
              onMouseDown={(e) => e.stopPropagation()} // CHẶN LỆNH KÉO KHI CHỈ MUỐN TICK CÔNG VIỆC
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                zIndex: 10, // ƯU TIÊN HIỂN THỊ LỚP TRÊN CÙNG
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
                    // HIỆU ỨNG GẠCH NGANG TRUYỀN THẦN CHO TASK XONG
                    textDecoration: card.isDone ? 'line-through' : 'none', 
                    fontWeight: card.isDone ? 'normal' : '500'
                }}
            >
                {card.title}
            </Typography>
        </Paper>
    );
}
