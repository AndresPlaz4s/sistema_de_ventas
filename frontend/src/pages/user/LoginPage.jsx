import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './LoginPage.module.css'

const IconMail = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16v12H4z" /><path d="M4 8l8 6 8-6" />
    </svg>
)
const IconLock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
)
const IconEye = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)
const IconEyeOff = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l18 18" />
        <path d="M10.5 10.5a3 3 0 004.2 4.2" />
        <path d="M3 12s3.5-7 9-7c2 0 3.7.5 5.2 1.4" />
        <path d="M21 12s-3.5 7-9 7c-2 0-3.8-.5-5.3-1.5" />
    </svg>
)

function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading]   = useState(false)
    const [mounted, setMounted]   = useState(false)
    const [success, setSuccess]   = useState(false)
    const [userBack, setUserBack] = useState(null)

    const { login, error: authError } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 40)
        return () => clearTimeout(timer)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username || !password) return
        setLoading(true)
        const result = await login(username, password)
        if (result.ok) {
            setUserBack(result.info)
            setSuccess(true)
            setTimeout(() => navigate('/'), 2200)
            return
        }
        setLoading(false)
    }

    const getNombre = () => {
        if (!userBack) return username
        return userBack.first_name || userBack.username
    }

    const getInicial = () => {
        const n = getNombre()
        return n ? n[0].toUpperCase() : 'U'
    }

    const getSaludo = () => {
        const hora = new Date().getHours()
        if (hora < 12) return 'Buenos días'
        if (hora < 18) return 'Buenas tardes'
        return 'Buenas noches'
    }

    return (
        <div className={`${styles.page} ${mounted ? styles.loaded : ''}`}>
            <div className={`${styles.cardWrap} ${success ? styles.flip : ''}`}>

                {/* FRONT */}
                <div className={`${styles.card} ${styles.front}`}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Welcome back</h1>
                        <p className={styles.subtitle}>Continue to FarmaVisión.</p>
                    </div>

                    {authError && <div className={styles.error}>{authError}</div>}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <div className={styles.icon}><IconMail /></div>
                            <input
                                type="text"
                                placeholder="Email or username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <div className={styles.icon}><IconLock /></div>
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button type="button" className={styles.eye} onClick={() => setShowPass(!showPass)}>
                                {showPass ? <IconEyeOff /> : <IconEye />}
                            </button>
                        </div>
                        <button type="submit" className={styles.button}>
                            {loading ? 'Please wait...' : 'Continue'}
                        </button>
                    </form>
                </div>

                {/* BACK */}
                <div className={`${styles.card} ${styles.back}`}>
                    <div className={styles.successContent}>
                        <div className={styles.avatarWrap}>
                            {userBack?.foto_url ? (
                                <img
                                    src={userBack.foto_url}
                                    alt="foto"
                                    className={styles.avatarImg}
                                />
                            ) : (
                                <div className={styles.avatar}>{getInicial()}</div>
                            )}
                            <div className={styles.avatarRing} />
                        </div>
                        <div className={styles.saludo}>{getSaludo()},</div>
                        <h2 className={styles.nombre}>{getNombre()}</h2>
                        <p className={styles.rol}>
                            {userBack?.rol === 'admin' ? '👑 Administrador'
                            : userBack?.rol === 'vendedor' ? '🛍️ Vendedor'
                            : '👤 Usuario'}
                        </p>
                        <div className={styles.accessBadge}>
                            <span className={styles.dot} />
                            Acceso concedido
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default LoginPage