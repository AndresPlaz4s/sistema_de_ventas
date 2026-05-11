import { useEffect, useState } from 'react'
import api from '../../api/axios'
import styles from './ClientesPage.module.css'

const EMPTY_FORM = {
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
}

function ClientesPage() {
    const [clientes, setClientes] = useState([])
    const [loading, setLoading]   = useState(true)
    const [search, setSearch]     = useState('')
    const [modal, setModal]       = useState(false)
    const [form, setForm]         = useState(EMPTY_FORM)
    const [editId, setEditId]     = useState(null)
    const [saving, setSaving]     = useState(false)
    const [error, setError]       = useState(null)

    const fetchClientes = async () => {
        try {
            const { data } = await api.get('/clientes/')
            setClientes(data)
        } catch {
            setError('Error cargando clientes.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchClientes() }, [])

    const filtered = clientes.filter(c =>
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.documento?.includes(search) ||
        c.telefono?.includes(search)
    )

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setError(null)
        setModal(true)
    }

    const openEdit = (c) => {
        setForm({
            nombre:    c.nombre,
            documento: c.documento || '',
            telefono:  c.telefono  || '',
            email:     c.email     || '',
            direccion: c.direccion || '',
        })
        setEditId(c.id)
        setError(null)
        setModal(true)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        if (!form.nombre) {
            setError('El nombre es obligatorio.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            if (editId) {
                await api.put(`/clientes/${editId}/`, form)
            } else {
                await api.post('/clientes/', form)
            }
            await fetchClientes()
            setModal(false)
        } catch {
            setError('Error guardando cliente.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este cliente?')) return
        try {
            await api.delete(`/clientes/${id}/`)
            setClientes(clientes.filter(c => c.id !== id))
        } catch {
            alert('Error eliminando cliente.')
        }
    }

    const initials = (nombre) =>
        nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

    return (
        <div className={styles.page}>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Clientes</h1>
                    <p className={styles.sub}>{clientes.length} clientes registrados</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo cliente
                </button>
            </div>

            {/* Search */}
            <div className={styles.searchBar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    placeholder="Buscar por nombre, documento o teléfono..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}>No hay clientes.</div>
            ) : (
                <div className={styles.grid}>
                    {filtered.map(c => (
                        <div key={c.id} className={styles.card}>
                            <div className={styles.cardTop}>
                                <div className={styles.avatar}>{initials(c.nombre)}</div>
                                <div className={styles.cardActions}>
                                    <button className={styles.btnEdit} onClick={() => openEdit(c)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button className={styles.btnDelete} onClick={() => handleDelete(c.id)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className={styles.cardName}>{c.nombre}</div>
                            <div className={styles.cardInfo}>
                                {c.documento && (
                                    <span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5" />
                                            <path d="M15 3H9a1 1 0 00-1 1v3a1 1 0 001 1h6a1 1 0 001-1V4a1 1 0 00-1-1z" />
                                        </svg>
                                        {c.documento}
                                    </span>
                                )}
                                {c.telefono && (
                                    <span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.12 6.12l1.07-1.07a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                        </svg>
                                        {c.telefono}
                                    </span>
                                )}
                                {c.email && (
                                    <span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        {c.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className={styles.overlay} onClick={() => setModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>

                        <div className={styles.modalHeader}>
                            <h2>{editId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
                            <button className={styles.modalClose} onClick={() => setModal(false)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.formGrid}>
                            <div className={styles.fieldFull}>
                                <label>Nombre *</label>
                                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" />
                            </div>
                            <div>
                                <label>Documento</label>
                                <input name="documento" value={form.documento} onChange={handleChange} placeholder="CC / NIT" />
                            </div>
                            <div>
                                <label>Teléfono</label>
                                <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="300 000 0000" />
                            </div>
                            <div>
                                <label>Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                            </div>
                            <div>
                                <label>Dirección</label>
                                <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
                            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear cliente'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default ClientesPage