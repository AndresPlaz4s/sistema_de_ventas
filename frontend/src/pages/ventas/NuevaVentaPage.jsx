import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import styles from './NuevaVentaPage.module.css'

function NuevaVentaPage() {
    const navigate = useNavigate()

    const [productos,  setProductos]  = useState([])
    const [clientes,   setClientes]   = useState([])
    const [clienteId,  setClienteId]  = useState('')
    const [items,      setItems]      = useState([])
    const [searchProd, setSearchProd] = useState('')
    const [saving,     setSaving]     = useState(false)
    const [error,      setError]      = useState(null)

    useEffect(() => {
        const load = async () => {
            const [pRes, cRes] = await Promise.all([
                api.get('/productos/'),
                api.get('/clientes/'),
            ])
            setProductos(pRes.data)
            setClientes(cRes.data)
        }
        load()
    }, [])

    const prodFiltrados = productos.filter(p =>
        p.stock > 0 &&
        p.nombre.toLowerCase().includes(searchProd.toLowerCase())
    )

    const agregarItem = (producto) => {
        const existe = items.find(i => i.producto.id === producto.id)
        if (existe) {
            setItems(items.map(i =>
                i.producto.id === producto.id
                    ? { ...i, cantidad: i.cantidad + 1 }
                    : i
            ))
        } else {
            setItems([...items, {
                producto,
                cantidad: 1,
                precio_unitario: parseFloat(producto.precio),
            }])
        }
        setSearchProd('')
    }

    const updateCantidad = (id, val) => {
        const n = parseInt(val)
        if (isNaN(n) || n < 1) return
        const prod = productos.find(p => p.id === id)
        if (n > prod.stock) return
        setItems(items.map(i =>
            i.producto.id === id ? { ...i, cantidad: n } : i
        ))
    }

    const updatePrecio = (id, val) => {
        const n = parseFloat(val)
        if (isNaN(n) || n < 0) return
        setItems(items.map(i =>
            i.producto.id === id ? { ...i, precio_unitario: n } : i
        ))
    }

    const removeItem = (id) => {
        setItems(items.filter(i => i.producto.id !== id))
    }

    const subtotal  = items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0)
    const ivaVal    = items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario * (i.producto.iva ?? 0) / 100, 0)
    const total     = subtotal + ivaVal

    const fmt = (n) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

    const handleSubmit = async () => {
        if (items.length === 0) {
            setError('Agrega al menos un producto.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            await api.post('/ventas/', {
                cliente: clienteId || null,
                observaciones: '',
                detalles: items.map(i => ({
                    producto: i.producto.id,
                    cantidad: i.cantidad,
                    precio_unitario: i.precio_unitario,
                    subtotal: i.cantidad * i.precio_unitario,
                })),
            })
            navigate('/ventas/historial')
        } catch (err) {
            setError('Error guardando la venta.')
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Nueva venta</h1>
                    <p className={styles.sub}>Agrega productos y confirma</p>
                </div>
                <button className={styles.btnBack} onClick={() => navigate(-1)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver
                </button>
            </div>

            <div className={styles.layout}>

                {/* LEFT — buscador de productos */}
                <div className={styles.left}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Productos</h2>
                        <div className={styles.searchBar}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                placeholder="Buscar producto..."
                                value={searchProd}
                                onChange={e => setSearchProd(e.target.value)}
                            />
                        </div>

                        <div className={styles.prodList}>
                            {prodFiltrados.length === 0 ? (
                                <p className={styles.empty}>No hay productos disponibles.</p>
                            ) : prodFiltrados.map(p => (
                                <button
                                    key={p.id}
                                    className={styles.prodItem}
                                    onClick={() => agregarItem(p)}
                                >
                                    <div className={styles.prodInfo}>
                                        <span className={styles.prodNombre}>{p.nombre}</span>
                                        <span className={styles.prodStock}>Stock: {p.stock}</span>
                                    </div>
                                    <span className={styles.prodPrecio}>{fmt(p.precio)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — resumen */}
                <div className={styles.right}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>Resumen</h2>

                        {/* Cliente */}
                        <div className={styles.field}>
                            <label>Cliente (opcional)</label>
                            <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
                                <option value="">Cliente general</option>
                                {clientes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Items */}
                        {items.length === 0 ? (
                            <div className={styles.emptyCart}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 01-8 0" />
                                </svg>
                                <p>Agrega productos desde la izquierda</p>
                            </div>
                        ) : (
                            <div className={styles.itemsList}>
                                {items.map(i => (
                                    <div key={i.producto.id} className={styles.itemRow}>
                                        <div className={styles.itemTop}>
                                            <span className={styles.itemName}>{i.producto.nombre}</span>
                                            <button className={styles.btnRemove} onClick={() => removeItem(i.producto.id)}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className={styles.itemControls}>
                                            <div className={styles.counter}>
                                                <button
                                                    className={styles.counterBtn}
                                                    onClick={() => updateCantidad(i.producto.id, i.cantidad - 1)}
                                                    disabled={i.cantidad <= 1}
                                                >−</button>
                                                <span className={styles.counterVal}>{i.cantidad}</span>
                                                <button
                                                    className={styles.counterBtn}
                                                    onClick={() => updateCantidad(i.producto.id, i.cantidad + 1)}
                                                    disabled={i.cantidad >= i.producto.stock}
                                                >+</button>
                                            </div>
                                            <input
                                                type="number"
                                                className={styles.inputPrecio}
                                                value={i.precio_unitario}
                                                min={0}
                                                onChange={e => updatePrecio(i.producto.id, e.target.value)}
                                            />
                                            <span className={styles.itemSubtotal}>
                                                {fmt(i.cantidad * i.precio_unitario)}
                                            </span>
                                        </div>
                                        <div className={styles.itemStockHint}>
                                            Stock disponible: {i.producto.stock - i.cantidad}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total */}
                        <div className={styles.totalesBox}>
                            <div className={styles.totalesRow}>
                                <span>Subtotal</span>
                                <span>{fmt(subtotal)}</span>
                            </div>
                            <div className={styles.totalesRow}>
                                <span>IVA</span>
                                <span>{fmt(ivaVal)}</span>
                            </div>
                            <div className={`${styles.totalesRow} ${styles.totalFinal}`}>
                                <span>Total</span>
                                <span className={styles.totalVal}>{fmt(total)}</span>
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <button
                            className={styles.btnConfirmar}
                            onClick={handleSubmit}
                            disabled={saving || items.length === 0}
                        >
                            {saving ? 'Guardando...' : 'Confirmar venta'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default NuevaVentaPage