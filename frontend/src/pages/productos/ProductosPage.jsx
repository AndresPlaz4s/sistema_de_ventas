import { useEffect, useState } from 'react'
import api from '../../api/axios'
import styles from './ProductosPage.module.css'

const EMPTY_FORM = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    stock_minimo: '5',
    proveedor: '',
    fecha_vencimiento: '',
}

function ProductosPage() {
    const [productos, setProductos]     = useState([])
    const [proveedores, setProveedores] = useState([])
    const [loading, setLoading]         = useState(true)
    const [search, setSearch]           = useState('')
    const [modal, setModal]             = useState(false)
    const [form, setForm]               = useState(EMPTY_FORM)
    const [editId, setEditId]           = useState(null)
    const [saving, setSaving]           = useState(false)
    const [error, setError]             = useState(null)

    const fetchProductos = async () => {
        try {
            const [pRes, provRes] = await Promise.all([
                api.get('/productos/'),
                api.get('/proveedores/'),
            ])
            setProductos(pRes.data)
            setProveedores(provRes.data)
        } catch {
            setError('Error cargando productos.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchProductos() }, [])

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    )

    const openCreate = () => {
        setForm(EMPTY_FORM)
        setEditId(null)
        setError(null)
        setModal(true)
    }

    const openEdit = (p) => {
        setForm({
            nombre:           p.nombre,
            descripcion:      p.descripcion,
            precio:           p.precio,
            stock:            p.stock,
            stock_minimo:     p.stock_minimo,
            proveedor:        p.proveedor || '',
            fecha_vencimiento: p.fecha_vencimiento || '',
        })
        setEditId(p.id)
        setError(null)
        setModal(true)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        if (!form.nombre || !form.precio || !form.stock) {
            setError('Nombre, precio y stock son obligatorios.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            const payload = {
                ...form,
                proveedor:        form.proveedor || null,
                fecha_vencimiento: form.fecha_vencimiento || null,
            }
            if (editId) {
                await api.put(`/productos/${editId}/`, payload)
            } else {
                await api.post('/productos/', payload)
            }
            await fetchProductos()
            setModal(false)
        } catch (err) {
            setError('Error guardando producto.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este producto?')) return
        try {
            await api.delete(`/productos/${id}/`)
            setProductos(productos.filter(p => p.id !== id))
        } catch {
            alert('Error eliminando producto.')
        }
    }

    const fmt = (n) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

    return (
        <div className={styles.page}>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Productos</h1>
                    <p className={styles.sub}>{productos.length} productos registrados</p>
                </div>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo producto
                </button>
            </div>

            {/* Search */}
            <div className={styles.searchBar}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                    placeholder="Buscar producto..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}>No hay productos.</div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Stock mín.</th>
                                <th>Proveedor</th>
                                <th>Vencimiento</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className={p.bajo_stock ? styles.rowAlert : ''}>
                                    <td>
                                        <span className={styles.nombre}>{p.nombre}</span>
                                        {p.bajo_stock && (
                                            <span className={styles.badge}>Bajo stock</span>
                                        )}
                                    </td>
                                    <td>{fmt(p.precio)}</td>
                                    <td className={p.bajo_stock ? styles.stockLow : ''}>{p.stock}</td>
                                    <td>{p.stock_minimo}</td>
                                    <td>{p.proveedor_nombre || '—'}</td>
                                    <td>{p.fecha_vencimiento || '—'}</td>
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
                            <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
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
                                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre del producto" />
                            </div>
                            <div className={styles.fieldFull}>
                                <label>Descripción</label>
                                <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción opcional" />
                            </div>
                            <div>
                                <label>Precio *</label>
                                <input name="precio" type="number" value={form.precio} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label>Stock *</label>
                                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label>Stock mínimo</label>
                                <input name="stock_minimo" type="number" value={form.stock_minimo} onChange={handleChange} placeholder="5" />
                            </div>
                            <div>
                                <label>Proveedor</label>
                                <select name="proveedor" value={form.proveedor} onChange={handleChange}>
                                    <option value="">Sin proveedor</option>
                                    {proveedores.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Fecha vencimiento</label>
                                <input name="fecha_vencimiento" type="date" value={form.fecha_vencimiento} onChange={handleChange} />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
                            <button className={styles.btnPrimary} onClick={handleSubmit} disabled={saving}>
                                {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear producto'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default ProductosPage