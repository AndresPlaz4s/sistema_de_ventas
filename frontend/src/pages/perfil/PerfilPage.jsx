import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import styles from './PerfilPage.module.css'

function PerfilPage() {
    const { userInfo, setUserInfo } = useAuth()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [exito, setExito] = useState(null)
    const [preview, setPreview] = useState(null)
    const [file, setFile] = useState(null)
    const fileRef = useRef()

    const getNombre = () => userInfo?.first_name || userInfo?.username || 'Usuario'
    const getInicial = () => getNombre()[0].toUpperCase()
    const getFotoUrl = () => preview || userInfo?.foto_url || null

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setExito(null)
        setError(null)
    }

const handleSubirFoto = async () => {
    if (!file) return
    setSaving(true)
    setError(null)
    setExito(null)
    try {
        const formData = new FormData()
        formData.append('foto', file)
        const res = await api.post('/usuarios/subir_foto/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        const updated = { ...userInfo, foto_url: res.data.foto_url }
        localStorage.setItem('userInfo', JSON.stringify(updated))
        setUserInfo(updated)
        setFile(null)
        setPreview(res.data.foto_url)
        setExito('Foto actualizada correctamente.')
    } catch {
        setError('Error subiendo la foto.')
    } finally {
        setSaving(false)
    }
}

    const getRolLabel = () => {
        if (userInfo?.rol === 'admin') return '👑 Administrador'
        if (userInfo?.rol === 'vendedor') return '🛍️ Vendedor'
        return '👤 Usuario'
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Mi perfil</h1>
                <p className={styles.sub}>Gestiona tu información personal y foto de perfil</p>
            </div>

            <div className={styles.grid}>

                {/* Foto */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Foto de perfil</h2>

                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrap}>
                            {getFotoUrl() ? (
                                <img src={getFotoUrl()} alt="perfil" className={styles.avatarImg} />
                            ) : (
                                <div className={styles.avatarLetra}>{getInicial()}</div>
                            )}
                            <button
                                className={styles.avatarEdit}
                                onClick={() => fileRef.current.click()}
                                title="Cambiar foto"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </button>
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {file && (
                            <p className={styles.fileName}>📎 {file.name}</p>
                        )}

                        {error && <div className={styles.error}>{error}</div>}
                        {exito && <div className={styles.success}>{exito}</div>}

                        <div className={styles.avatarBtns}>
                            <button
                                className={styles.btnSecondary}
                                onClick={() => fileRef.current.click()}
                            >
                                {getFotoUrl() ? 'Cambiar foto' : 'Subir foto'}
                            </button>
                            {file && (
                                <button
                                    className={styles.btnPrimary}
                                    onClick={handleSubirFoto}
                                    disabled={saving}
                                >
                                    {saving ? 'Subiendo...' : 'Guardar foto'}
                                </button>
                            )}
                        </div>

                        <p className={styles.hint}>JPG, PNG o GIF. Máximo 5MB.</p>
                    </div>
                </div>

                {/* Info */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Información personal</h2>

                    <div className={styles.infoList}>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Nombre completo</span>
                            <span className={styles.infoValor}>
                                {userInfo?.nombre_completo || '—'}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Usuario</span>
                            <span className={styles.infoValor}>@{userInfo?.username}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Email</span>
                            <span className={styles.infoValor}>{userInfo?.email || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Teléfono</span>
                            <span className={styles.infoValor}>{userInfo?.telefono || '—'}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>Rol</span>
                            <span className={styles.infoValor}>{getRolLabel()}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PerfilPage