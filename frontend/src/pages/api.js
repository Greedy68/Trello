import axios from 'axios';

// 1. Khởi tạo instance thô của Axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5002/api'
});

// 2. Interceptor giữ nguyên (để đính kèm Token tự động)
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. Tự động xử lý lỗi 401
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            if (window.location.pathname !== '/login') window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 4. ĐỊNH NGHĨA CÁC SERVICE
const api = {
    //Auth
    auth: {
        login: (data) => axiosInstance.post('/auth/login', data),
        register: (data) => axiosInstance.post('/auth/register', data),
    },
    //Board
    board: {
        getAll: () => axiosInstance.get('/boards'),
        getById: (id) => axiosInstance.get(`/boards/${id}`),
        create: (data) => axiosInstance.post('/boards', data),
    },
    //List
    list: {
        create: (data) => axiosInstance.post('/lists', data),
        delete: (id) => axiosInstance.delete(`/lists/${id}`),
    },
    //Card
    card: {
        create: (data) => axiosInstance.post('/cards', data),
        update: (id, data) => axiosInstance.patch(`/cards/${id}`, data),
        delete: (id) => axiosInstance.delete(`/cards/${id}`),
    }
};

export default api;
