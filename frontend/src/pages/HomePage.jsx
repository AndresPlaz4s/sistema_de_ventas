import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import HomeCSS from './HomePage.module.css'

function HomePage() {
    const navigate = useNavigate()

    const [ventasHoy, setVentasHoy]         = useState({ total: 0, count: 0 })
    const [caja, setCaja]                   = useState(null)
    const [productos, setProductos]         = useState({ total: 0, bajoStock: [] })
    const [clientes, setClientes]           = useState({ total: 0, nuevosHoy: 0 })
    const [ultimasVentas, setUltimasVentas] = useState([])
    const [loading, setLoading]             = useState(true)

    const now   = new Date()
    const fecha = now.toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const hoy = now.toISOString().split('T')[0]

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [ventasRes, cajaRes, productosRes, clientesRes, bajoStockRes] =
                await Promise.all([
                    api.get('/ventas/'),
                    api.get('/caja/activa/'),
                    api.get('/productos/'),
                    api.get('/clientes/'),
                    api.get('/productos/bajo_stock/'),
                ])

            const todasVentas = ventasRes.data
            const ventasDeHoy = todasVentas.filter(v =>
                v.fecha?.startsWith(hoy) && v.estado === 'completada'
            )
            const totalHoy = ventasDeHoy.reduce((acc, v) => acc + parseFloat(v.total), 0)
            setVentasHoy({ total: totalHoy, count: ventasDeHoy.length })
            setUltimasVentas(ventasDeHoy.slice(0, 5))

            setCaja(cajaRes.data.caja)

            setProductos({ total: productosRes.data.length, bajoStock: bajoStockRes.data })

            const todosClientes = clientesRes.data
            const nuevosHoy = todosClientes.filter(c => c.created_at?.startsWith(hoy)).length
            setClientes({ total: todosClientes.length, nuevosHoy })

        } catch (err) {
            console.error('Error cargando dashboard:', err)
        } finally {
            setLoading(false)
        }
    }, [hoy])

    useEffect(() => {
        fetchData()
        window.addEventListener('cajaAbierta', fetchData)
        return () => window.removeEventListener('cajaAbierta', fetchData)
    }, [fetchData])

    const fmt = (n) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

    const stats = [
        {
            label: 'Ventas del día',
            value: loading ? '...' : fmt(ventasHoy.total),
            sub: loading ? '' : `${ventasHoy.count} transacciones`,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: '#7c3aed', bg: '#f5f3ff',
        },
        {
            label: 'Total en caja',
            value: loading ? '...' : caja ? fmt(caja.monto_inicial) : 'Sin caja',
            sub: loading ? '' : caja ? `Apertura: ${fmt(caja.monto_inicial)}` : 'No hay caja abierta',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            color: '#059669', bg: '#ecfdf5',
        },
        {
            label: 'Productos',
            value: loading ? '...' : `${productos.total}`,
            sub: loading ? '' : `${productos.bajoStock.length} con bajo stock`,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: '#d97706', bg: '#fffbeb',
        },
        {
            label: 'Clientes',
            value: loading ? '...' : `${clientes.total}`,
            sub: loading ? '' : `${clientes.nuevosHoy} nuevos hoy`,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            color: '#2563eb', bg: '#eff6ff',
        },
    ]

    return (
        <div className={HomeCSS.page}>

            {/* Header */}
            <div className={HomeCSS.header}>
                <div>
                    <h1 className={HomeCSS.title}>Inicio</h1>
                    <p className={HomeCSS.date}>{fecha}</p>
                </div>
                <button className={HomeCSS.btnPrimary} onClick={() => navigate('/ventas/nueva')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva venta
                </button>
            </div>

            {/* Stats */}
            <div className={HomeCSS.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={HomeCSS.statCard}>
                        <div className={HomeCSS.statTop}>
                            <div className={HomeCSS.statIcon} style={{ background: stat.bg, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span className={HomeCSS.statLabel}>{stat.label}</span>
                        </div>
                        <div className={HomeCSS.statValue} style={{ color: stat.color }}>{stat.value}</div>
                        <div className={HomeCSS.statSub}>{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Contenido inferior */}
            <div className={HomeCSS.bottomGrid}>

                {/* Últimas ventas */}
                <div className={HomeCSS.card}>
                    <div className={HomeCSS.cardHeader}>
                        <h2 className={HomeCSS.cardTitle}>Últimas ventas</h2>
                        <button className={HomeCSS.cardLink} onClick={() => navigate('/ventas/historial')}>Ver todo</button>
                    </div>
                    {ultimasVentas.length === 0 ? (
                        <div className={HomeCSS.emptyState}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>No hay ventas hoy</p>
                        </div>
                    ) : (
                        <div className={HomeCSS.ventasList}>
                            {ultimasVentas.map((v) => (
                                <div key={v.id} className={HomeCSS.ventaItem}>
                                    <div>
                                        <span className={HomeCSS.ventaId}>#{v.id}</span>
                                        <span className={HomeCSS.ventaCliente}>
                                            {v.cliente_nombre || 'Cliente general'}
                                        </span>
                                    </div>
                                    <span className={HomeCSS.ventaTotal}>{fmt(v.total)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bajo stock */}
                <div className={HomeCSS.card}>
                    <div className={HomeCSS.cardHeader}>
                        <h2 className={HomeCSS.cardTitle}>Bajo stock</h2>
                        <button className={HomeCSS.cardLink} onClick={() => navigate('/inventario/bajo-stock')}>Ver todo</button>
                    </div>
                    {productos.bajoStock.length === 0 ? (
                        <div className={HomeCSS.emptyState}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p>No hay productos con bajo stock</p>
                        </div>
                    ) : (
                        <div className={HomeCSS.ventasList}>
                            {productos.bajoStock.map((p) => (
                                <div key={p.id} className={HomeCSS.ventaItem}>
                                    <span className={HomeCSS.ventaCliente}>{p.nombre}</span>
                                    <span className={HomeCSS.stockBadge}>{p.stock} uds</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default HomePage