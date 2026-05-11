import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser]         = useState(null)
    const [userInfo, setUserInfo] = useState(null)
    const [loading, setLoading]   = useState(true)
    const [error, setError]       = useState(null)

    useEffect(() => {
        const access = localStorage.getItem('access')
        const savedUser = localStorage.getItem('user')
        if (access && savedUser) {
            setUser(savedUser)
            try {
                setUserInfo(JSON.parse(localStorage.getItem('userInfo')))
            } catch {}
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        setError(null)
        try {
            const { data } = await axios.post(
                'http://127.0.0.1:8000/api/token/',
                { username, password }
            )
            localStorage.setItem('access', data.access)
            localStorage.setItem('refresh', data.refresh)
            localStorage.setItem('user', username)

            const { data: info } = await axios.get(
                'http://127.0.0.1:8000/api/usuarios/me/',
                { headers: { Authorization: `Bearer ${data.access}` } }
            )
            localStorage.setItem('userInfo', JSON.stringify(info))
            setUserInfo(info)
            setUser(username)
            return { ok: true, info }
        } catch (err) {
            const msg = err.response?.data?.detail || 'Usuario o contraseña incorrectos.'
            setError(msg)
            return { ok: false }
        }
    }

    const logout = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('user')
        localStorage.removeItem('userInfo')
        setUser(null)
        setUserInfo(null)
    }

    return (
        <AuthContext.Provider value={{ user, userInfo, setUserInfo, loading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}