import { useEffect, useState } from 'react'
import api from '../../api/axios'
import styles from './UsuariosPage.module.css'

const ROLES = [
    { value: 'admin', label: 'Administrador' },
    { value: 'vendedor', label: 'Vendedor' },
]

const avatarStyle = [
    { bg: '#e0e7ff', color: '#4338ca' },
    { bg: '#fce7f3', color: '#be185d' },
    { bg: '#dcfce7', color: '#15803d' },
    { bg: '#fef3c7', color: '#b45309' },
    { bg: '#f3e8ff', color: '#7e22ce' },
]

function getAvatar(username) {
    const idx = username.charCodeAt(0) % avatarStyle.length
    return avatarStyle[idx]
}

function UsuariosPage() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [exito, setExito] = useState(null)
    const [modal, setModal] = useState(false)
    const [selected, setSelected] = useState(null)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const [form, setForm] = useState({
        username: '', email: '', first_name: '', last_name: '',
        password: '', rol: 'vendedor', telefono: '', foto: null,
    })
    const [fotoPreview, setFotoPreview] = useState(null)

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const res = await api.get('/usuarios/')
            setUsuarios(res.data)
        } catch {
            setError('Error cargando usuarios.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsuarios() }, [])

    const abrirCrear = () => {
        setForm({ username: '', email: '', first_name: '', last_name: '', password: '', rol: 'vendedor', telefono: '', foto: null })
        setFotoPreview(null)
        setSelected(null)
        setError(null)
        setModal('crear')
    }

    const abrirEditar = (u) => {
        setForm({
            username: u.username, email: u.email, first_name: u.first_name,
            last_name: u.last_name, password: '', rol: u.rol, telefono: u.telefono, foto: null
        })
        setFotoPreview(u.foto_url || null) // muestra foto actual del usuario
        setSelected(u)
        setError(null)
        setModal('editar')
    }

    const cerrarModal = () => {
        setModal(false)
        setSelected(null)
        setError(null)
        setFotoPreview(null)
    }

    const handleFoto = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setForm(f => ({ ...f, foto: file }))
        setFotoPreview(URL.createObjectURL(file))
    }

    const handleGuardar = async () => {
        setSaving(true); setError(null)
        try {
            if (modal === 'crear') {
                const data = new FormData()
                Object.entries(form).forEach(([k, v]) => {
                    if (k === 'foto' && v) {
                        data.append('foto_perfil', v) // campo correcto del backend
                    } else if (v !== null && v !== '') {
                        data.append(k, v)
                    }
                })
                await api.post('/usuarios/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                setExito('Usuario creado correctamente.')
            } else {
                const data = new FormData()
                if (form.first_name) data.append('first_name', form.first_name)
                if (form.last_name) data.append('last_name', form.last_name)
                if (form.email) data.append('email', form.email)
                if (form.telefono) data.append('telefono', form.telefono)
                if (form.rol) data.append('rol', form.rol)
                if (form.password) data.append('password', form.password)
                if (form.foto) data.append('foto_perfil', form.foto) // solo si cambió
                await api.patch(`/usuarios/${selected.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                setExito('Usuario actualizado.')
            }
            cerrarModal(); fetchUsuarios()
        } catch (err) {
            const data = err.response?.data
            setError(data ? Object.values(data).flat().join(' ') : 'Error guardando.')
        } finally { setSaving(false) }
    }

    const handleToggle = async (u) => {
        try { await api.post(`/usuarios/${u.id}/toggle_activo/`); fetchUsuarios() }
        catch { setError('Error cambiando estado.') }
    }

    const filtrados = usuarios.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.nombre_completo?.toLowerCase().includes(search.toLowerCase())
    )

    const totalActivos = usuarios.filter(u => u.activo).length
    const totalAdmins = usuarios.filter(u => u.rol === 'admin').length

    // Bloque reutilizable para subir foto (crear y editar)
    const FotoUpload = () => (
        <div className={styles.photoRow}>
            <div className={styles.avatarUpload}>
                {fotoPreview
                    ? <img src={fotoPreview} alt="preview" className={styles.avatarImg} />
                    : <span>{form.first_name?.[0]?.toUpperCase() || '?'}</span>
                }
                <label className={styles.avatarOverlay} htmlFor="foto-input" title="Subir foto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                </label>
                <input
                    id="foto-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFoto}
                />
            </div>
            <div className={styles.photoHint}>
                <p>Foto de perfil</p>
                <span>JPG o PNG · máx. 2 MB · opcional</span>
                {fotoPreview && (
                    <button
                        className={styles.removePhoto}
                        onClick={() => {
                            setFotoPreview(null)
                            setForm(f => ({ ...f, foto: null }))
                        }}
                    >
                        Quitar foto
                    </button>
                )}
            </div>
        </div>
    )

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <div className={styles.titleBlock}>
                    <h1 className={styles.title}>Usuarios</h1>
                    <p className={styles.sub}>Gestiona los accesos y roles del sistema</p>
                </div>
                <button className={styles.btnPrimary} onClick={abrirCrear}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo usuario
                </button>
            </div>

            {exito && <div className={styles.success}>{exito}</div>}

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statDot} style={{ background: '#6366f1' }} />
                    <div className={styles.statInfo}>
                        <span className={styles.statNum}>{usuarios.length}</span>
                        <span className={styles.statLabel}>Total usuarios</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statDot} style={{ background: '#16a34a' }} />
                    <div className={styles.statInfo}>
                        <span className={styles.statNum}>{totalActivos}</span>
                        <span className={styles.statLabel}>Activos</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statDot} style={{ background: '#ea580c' }} />
                    <div className={styles.statInfo}>
                        <span className={styles.statNum}>{totalAdmins}</span>
                        <span className={styles.statLabel}>Administradores</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input className={styles.searchInput} placeholder="Buscar usuario..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Cards */}
            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : filtrados.length === 0 ? (
                <div className={styles.empty}>No hay usuarios.</div>
            ) : (
                <div className={styles.cardsGrid}>
                    {filtrados.map(u => {
                        const av = getAvatar(u.username)
                        return (
                            <div key={u.id} className={`${styles.userCard} ${styles[u.rol]}`}>
                                <div className={styles.cardTop}>
                                    <div className={styles.avatar} style={{ background: av.bg, color: av.color }}>
                                        {u.foto_url  // ← corregido: era u.foto
                                            ? <img src={u.foto_url} alt={u.username} className={styles.avatarImg} />
                                            : (u.first_name?.[0] || u.username[0]).toUpperCase()
                                        }
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <p className={styles.cardName}>{u.nombre_completo || u.username}</p>
                                        <span className={styles.cardUsername}>@{u.username}</span>
                                    </div>
                                    <span className={`${styles.rolBadge} ${styles[`rol_${u.rol}`]}`}>
                                        {ROLES.find(r => r.value === u.rol)?.label}
                                    </span>
                                </div>

                                <div className={styles.divider} />

                                <div className={styles.cardMeta}>
                                    <div className={styles.metaRow}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {u.email || 'Sin email'}
                                    </div>
                                    <div className={styles.metaRow}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {u.telefono || 'Sin teléfono'}
                                    </div>
                                    <div className={styles.metaRow}>
                                        <span className={`${styles.estadoBadge} ${u.activo ? styles.activo : styles.inactivo}`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button className={styles.btnEdit} onClick={() => abrirEditar(u)}>Editar</button>
                                    <button
                                        className={u.activo ? styles.btnDanger : styles.btnSuccess}
                                        onClick={() => handleToggle(u)}
                                    >
                                        {u.activo ? 'Desactivar' : 'Activar'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className={styles.overlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalTop}>
                            <h2 className={styles.modalTitle}>
                                {modal === 'crear' ? 'Nuevo usuario' : 'Editar usuario'}
                            </h2>
                            <button className={styles.closeBtn} onClick={cerrarModal}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            {error && <div className={styles.error}>{error}</div>}

                            {/* Foto de perfil — en crear Y editar */}
                            <FotoUpload />

                            <div className={styles.formGrid}>
                                <div className={styles.field}>
                                    <label>Nombre *</label>
                                    <input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Nombre" />
                                </div>
                                <div className={styles.field}>
                                    <label>Apellido</label>
                                    <input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Apellido" />
                                </div>
                                <div className={styles.field}>
                                    <label>Usuario *</label>
                                    <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" disabled={modal === 'editar'} />
                                </div>
                                <div className={styles.field}>
                                    <label>Email</label>
                                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                                </div>
                                <div className={styles.field}>
                                    <label>{modal === 'crear' ? 'Contraseña *' : 'Nueva contraseña (opcional)'}</label>
                                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
                                </div>
                                <div className={styles.field}>
                                    <label>Teléfono</label>
                                    <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="300 000 0000" />
                                </div>
                                <div className={`${styles.field} ${styles.fullWidth}`}>
                                    <label>Rol *</label>
                                    <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button className={styles.btnSecondary} onClick={cerrarModal}>Cancelar</button>
                                <button className={styles.btnPrimary} onClick={handleGuardar} disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsuariosPage