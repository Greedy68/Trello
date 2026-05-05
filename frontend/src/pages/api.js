import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://localhost:5002/api'
});


axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


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


const api = {

    auth: {
        login: (data) => axiosInstance.post('/auth/login', data),
        register: (data) => axiosInstance.post('/auth/register', data),
    },

    board: {
        getAll: () => axiosInstance.get('/boards'),
        getById: (id) => axiosInstance.get(`/boards/${id}`),
        create: (data) => axiosInstance.post('/boards', data),
    },

    list: {
        create: (data) => axiosInstance.post('/lists', data),
        delete: (id) => axiosInstance.delete(`/lists/${id}`),
    },

    card: {
        create: (data) => axiosInstance.post('/cards', data),
        update: (id, data) => axiosInstance.patch(`/cards/${id}`, data),
        delete: (id) => axiosInstance.delete(`/cards/${id}`),
        reorder: (id, data) => axiosInstance.put(`/cards/${id}/reorder`, data)
    }
};

export default api;
