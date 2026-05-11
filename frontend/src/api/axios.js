import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
})

// Agrega el token JWT a cada request automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Si el token expira, intenta refrescarlo automáticamente
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true

            try {
                const refresh = localStorage.getItem('refresh')
                const { data } = await axios.post(
                    'http://127.0.0.1:8000/api/token/refresh/',
                    { refresh }
                )
                localStorage.setItem('access', data.access)
                original.headers.Authorization = `Bearer ${data.access}`
                return api(original)
            } catch {
                localStorage.removeItem('access')
                localStorage.removeItem('refresh')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default api