import { useEffect, useState } from 'react'
import api from '../../api/axios'
import styles from './VentasPage.module.css'

function VentasPage() {
    const [ventas, setVentas]       = useState([])
    const [loading, setLoading]     = useState(true)
    const [search, setSearch]       = useState('')
    const [filtroEstado, setFiltro] = useState('todas')
    const [detalle, setDetalle]     = useState(null)

    const fetchVentas = async () => {
        try {
            const { data } = await api.get('/ventas/')
            setVentas(data)
        } catch {
            console.error('Error cargando ventas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchVentas() }, [])

    const filtered = ventas.filter(v => {
        const matchSearch =
            String(v.id).includes(search) ||
            v.cliente_nombre?.toLowerCase().includes(search.toLowerCase()) ||
            v.usuario_nombre?.toLowerCase().includes(search.toLowerCase())
        const matchEstado = filtroEstado === 'todas' || v.estado === filtroEstado
        return matchSearch && matchEstado
    })

    const handleAnular = async (id) => {
        if (!confirm('¿Anular esta venta? Se devolverá el stock.')) return
        try {
            await api.post(`/ventas/${id}/anular/`)
            await fetchVentas()
            setDetalle(null)
        } catch {
            alert('Error anulando venta.')
        }
    }

    const fmt = (n) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

    const fmtFecha = (f) =>
        new Date(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

    const estadoBadge = (estado) => {
        const map = {
            completada: styles.badgeGreen,
            pendiente:  styles.badgeYellow,
            anulada:    styles.badgeRed,
        }
        return map[estado] || ''
    }

    const totales = {
        completadas: ventas.filter(v => v.estado === 'completada').reduce((a, v) => a + parseFloat(v.total), 0),
        count: ventas.filter(v => v.estado === 'completada').length,
        anuladas: ventas.filter(v => v.estado === 'anulada').length,
    }

    return (
        <div className={styles.page}>

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Ventas</h1>
                    <p className={styles.sub}>{ventas.length} ventas registradas</p>
                </div>
            </div>

            {/* Summary */}
            <div className={styles.summary}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total vendido</span>
                    <span className={styles.summaryValue} style={{ color: '#059669' }}>{fmt(totales.completadas)}</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Ventas completadas</span>
                    <span className={styles.summaryValue} style={{ color: '#7c3aed' }}>{totales.count}</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Ventas anuladas</span>
                    <span className={styles.summaryValue} style={{ color: '#dc2626' }}>{totales.anuladas}</span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        placeholder="Buscar por ID, cliente o usuario..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className={styles.tabs}>
                    {['todas', 'completada', 'pendiente', 'anulada'].map(e => (
                        <button
                            key={e}
                            className={`${styles.tab} ${filtroEstado === e ? styles.tabActive : ''}`}
                            onClick={() => setFiltro(e)}
                        >
                            {e.charAt(0).toUpperCase() + e.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}>No hay ventas.</div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v.id}>
                                    <td className={styles.idCell}>#{v.id}</td>
                                    <td>{v.cliente_nombre || 'Cliente general'}</td>
                                    <td>{v.usuario_nombre || '—'}</td>
                                    <td>{fmtFecha(v.fecha)}</td>
                                    <td className={styles.totalCell}>{fmt(v.total)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${estadoBadge(v.estado)}`}>
                                            {v.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.btnDetail} onClick={() => setDetalle(v)}>
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detalle modal */}
            {detalle && (
                <div className={styles.overlay} onClick={() => setDetalle(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>

                        <div className={styles.modalHeader}>
                            <h2>Venta #{detalle.id}</h2>
                            <button className={styles.modalClose} onClick={() => setDetalle(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.detalleInfo}>
                            <div>
                                <span className={styles.detalleLabel}>Cliente</span>
                                <span className={styles.detalleVal}>{detalle.cliente_nombre || 'Cliente general'}</span>
                            </div>
                            <div>
                                <span className={styles.detalleLabel}>Usuario</span>
                                <span className={styles.detalleVal}>{detalle.usuario_nombre}</span>
                            </div>
                            <div>
                                <span className={styles.detalleLabel}>Fecha</span>
                                <span className={styles.detalleVal}>{fmtFecha(detalle.fecha)}</span>
                            </div>
                            <div>
                                <span className={styles.detalleLabel}>Estado</span>
                                <span className={`${styles.badge} ${estadoBadge(detalle.estado)}`}>{detalle.estado}</span>
                            </div>
                        </div>

                        <table className={styles.detalleTable}>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cant.</th>
                                    <th>Precio unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detalle.detalles?.map(d => (
                                    <tr key={d.id}>
                                        <td>{d.producto_nombre}</td>
                                        <td>{d.cantidad}</td>
                                        <td>{fmt(d.precio_unitario)}</td>
                                        <td>{fmt(d.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className={styles.detalleTotalRow}>
                            <span>Total</span>
                            <span className={styles.detalleTotal}>{fmt(detalle.total)}</span>
                        </div>

                        {detalle.estado !== 'anulada' && (
                            <div className={styles.modalFooter}>
                                <button className={styles.btnAnular} onClick={() => handleAnular(detalle.id)}>
                                    Anular venta
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    )
}

export default VentasPage