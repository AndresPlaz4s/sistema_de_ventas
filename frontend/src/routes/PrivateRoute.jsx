import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api/axios'
import ModalAbrirCaja from '../components/caja/ModalAbrirCaja'

function PrivateRoute({ children }) {
    const token = localStorage.getItem('access')
    const [verificando, setVerificando] = useState(true)
    const [cajaAbierta, setCajaAbierta] = useState(true)

    useEffect(() => {
        if (!token) return
        api.get('/caja/activa/')
            .then(res => setCajaAbierta(!!res.data.caja))
            .catch(() => setCajaAbierta(true))
            .finally(() => setVerificando(false))
    }, [token])

    if (!token) return <Navigate to="/login" />
    if (verificando) return null

    const handleCajaAbierta = () => {
        setCajaAbierta(true)
        // Disparar evento global para que el dashboard se actualice
        window.dispatchEvent(new CustomEvent('cajaAbierta'))
    }

    return (
        <>
            {!cajaAbierta && (
                <ModalAbrirCaja onCerrar={handleCajaAbierta} />
            )}
            {children}
        </>
    )
}

export default PrivateRoute