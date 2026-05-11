import { useEffect, useState } from 'react'
import api from '../../api/axios'
import styles from './ProveedoresPage.module.css'

const EMPTY_FORM = {
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
}

function ProveedoresPage() {
    const [proveedores, setProveedores] = useState([])
    const [loading, setLoading]         = useState(true)
    const [search, setSearch]           = useState('')
    const [modal, setModal]             = useState(false)
    const [form, setForm]               = useState(EMPTY_FORM)
    const [editId, setEditId]           = useState(null)
    const [saving, setSaving]           = useState(false)
    const [error, setError]             = useState(null)

    const fetchProveedores = async () => {
        try {
            const { data } = await api.get('/proveedores/')
            setProveedores(data)
        } catch {
            setError('Error cargando proveedores.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchProveedores() }, [])

    const filtered = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.telefono?.includes(search)
    )

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setError(null)
        setModal(true)
    }

    const openEdit = (p) => {
        setForm({
            nombre:    p.nombre,
            telefono:  p.telefono  || '',
            email:     p.email     || '',
            direccion: p.direccion || '',
        })
        setEditId(p.id)
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
                await api.put(`/proveedores/${editId}/`, form)
            } else {
                await api.post('/proveedores/', form)
            }
            await fetchProveedores()
            setModal(false)
        } catch {
            setError('Error guardando proveedor.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este proveedor?')) return
        try {
            await api.delete(`/proveedores/${id}/`)
            setProveedores(proveedores.filter(p => p.id !== id))
        } catch {
            alert('Error eliminando proveedor.')
        }
    }

    const initials = (nombre) =>
        nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

    return (
        <div className={styles.page}>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Proveedores</h1>
                    <p className={styles.sub}>{proveedores.length} proveedores registrados</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo proveedor
                </button>
            </div>

            {/* Search */}
            <div className={styles.searchBar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}>No hay proveedores.</div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Proveedor</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Dirección</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className={styles.provNombre}>
                                            <div className={styles.avatar}>{initials(p.nombre)}</div>
                                            <span>{p.nombre}</span>
                                        </div>
                                    </td>
                                    <td>{p.telefono || '—'}</td>
                                    <td>{p.email || '—'}</td>
                                    <td>{p.direccion || '—'}</td>
                                    <td className={styles.actions}>
                                        <button className={styles.btnEdit} onClick={() => openEdit(p)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button className={styles.btnDelete} onClick={() => handleDelete(p.id)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {modal && (
                <div className={styles.overlay} onClick={() => setModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>

                        <div className={styles.modalHeader}>
                            <h2>{editId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
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
                                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del proveedor" />
                            </div>
                            <div>
                                <label>Teléfono</label>
                                <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="300 000 0000" />
                            </div>
                            <div>
                                <label>Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
                            </div>
                            <div className={styles.fieldFull}>
                                <label>Dirección</label>
                                <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
                            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear proveedor'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default ProveedoresPage