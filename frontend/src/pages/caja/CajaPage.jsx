import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import styles from './CajaPage.module.css'
import { useAuth } from '../../context/AuthContext'

function CajaPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const esCerrar = location.pathname === '/caja/cerrar'

    const [cajaActiva, setCajaActiva] = useState(null)
    const [historial,  setHistorial]  = useState([])
    const [resumen,    setResumen]    = useState(null)
    const [loading,    setLoading]    = useState(true)
    const [monto,      setMonto]      = useState('')
    const [obs,        setObs]        = useState('')
    const [saving,     setSaving]     = useState(false)
    const [error,      setError]      = useState(null)
    const [exito,      setExito]      = useState(null)

    const fetchCaja = async () => {
        setLoading(true)
        try {
            const [activaRes, histRes] = await Promise.all([
                api.get('/caja/activa/'),
                api.get('/caja/'),
            ])
            setCajaActiva(activaRes.data.caja)
            setHistorial(histRes.data)
            if (activaRes.data.caja) {
                try {
                    const resRes = await api.get(`/caja/${activaRes.data.caja.id}/resumen/`)
                    setResumen(resRes.data)
                } catch {
                    setResumen(null)
                }
            }
        } catch {
            setError('Error cargando caja.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCaja() }, [])

    const handleAbrir = async () => {
        if (!monto || parseFloat(monto) < 0) {
            setError('Ingresa un monto inicial válido.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            await api.post('/caja/abrir/', {
                monto_inicial: parseFloat(monto),
                observaciones: obs,
            })
            setExito('Caja abierta correctamente.')
            setMonto('')
            setObs('')
            await fetchCaja()
        } catch (err) {
            setError(err.response?.data?.error || 'Error abriendo caja.')
        } finally {
            setSaving(false)
        }
    }

    const handleCerrar = async () => {
        if (!monto || parseFloat(monto) < 0) {
            setError('Ingresa el monto final en caja.')
            return
        }
        setSaving(true)
        setError(null)
        try {
            await api.post(`/caja/${cajaActiva.id}/cerrar/`, {
                monto_final: parseFloat(monto),
                observaciones: obs,
            })
            setExito('Caja cerrada. Cerrando sesión...')
            setTimeout(() => {
                logout()
                navigate('/login')
            }, 1500)
        } catch (err) {
            setError(err.response?.data?.error || 'Error cerrando caja.')
            setSaving(false)
        }
    }

    const fmt = (n) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n ?? 0)

    const fmtFecha = (f) =>
        new Date(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })

    // ─── VISTA CERRAR CAJA ───────────────────────────────────────────────
    if (esCerrar) {
        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Cerrar caja</h1>
                        <p className={styles.sub}>Resumen del turno y cierre de caja</p>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.empty}>Cargando...</div>
                ) : !cajaActiva ? (
                    <div className={`${styles.statusCard} ${styles.statusClosed}`}>
                        <div className={styles.statusDot} />
                        <div className={styles.statusInfo}>
                            <span className={styles.statusLabel}>No hay caja abierta</span>
                            <span className={styles.statusDetail}>Debes abrir la caja antes de cerrarla.</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {resumen && (
                            <div className={styles.resumenGrid}>
                                <div className={styles.resumenCard}>
                                    <span className={styles.resumenLabel}>Ventas del turno</span>
                                    <span className={styles.resumenValor}>{resumen.total_ventas ?? 0}</span>
                                </div>
                                <div className={styles.resumenCard}>
                                    <span className={styles.resumenLabel}>Total vendido</span>
                                    <span className={`${styles.resumenValor} ${styles.green}`}>{fmt(resumen.total_ingresos)}</span>
                                </div>
                                <div className={styles.resumenCard}>
                                    <span className={styles.resumenLabel}>Monto inicial</span>
                                    <span className={styles.resumenValor}>{fmt(cajaActiva.monto_inicial)}</span>
                                </div>
                                <div className={styles.resumenCard}>
                                    <span className={styles.resumenLabel}>Efectivo esperado</span>
                                    <span className={`${styles.resumenValor} ${styles.blue}`}>
                                        {fmt((cajaActiva.monto_inicial ?? 0) + (resumen.total_ingresos ?? 0))}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className={`${styles.statusCard} ${styles.statusOpen}`}>
                            <div className={styles.statusDot} />
                            <div className={styles.statusInfo}>
                                <span className={styles.statusLabel}>Caja abierta</span>
                                <span className={styles.statusDetail}>
                                    Apertura: {fmtFecha(cajaActiva.fecha_apertura)} · Por: {cajaActiva.usuario_nombre || '—'}
                                </span>
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}
                        {exito && <div className={styles.success}>{exito}</div>}

                        {!exito && (
                            <div className={styles.formCard}>
                                <h2 className={styles.sectionTitle}>Registrar cierre</h2>
                                <div className={styles.formCol}>
                                    <div className={styles.field}>
                                        <label>Monto final contado en caja *</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={monto}
                                            onChange={e => setMonto(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Observaciones</label>
                                        <input
                                            type="text"
                                            placeholder="Opcional"
                                            value={obs}
                                            onChange={e => setObs(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className={styles.btnDanger}
                                        onClick={handleCerrar}
                                        disabled={saving}
                                    >
                                        {saving ? 'Cerrando...' : 'Confirmar cierre de caja'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    // ─── VISTA ABRIR CAJA ────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Abrir caja</h1>
                    <p className={styles.sub}>Registra el monto inicial para comenzar el turno</p>
                </div>
            </div>

            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : cajaActiva ? (
                <div className={`${styles.statusCard} ${styles.statusOpen}`}>
                    <div className={styles.statusDot} />
                    <div className={styles.statusInfo}>
                        <span className={styles.statusLabel}>Ya hay una caja abierta</span>
                        <span className={styles.statusDetail}>
                            Apertura: {fmtFecha(cajaActiva.fecha_apertura)} · Monto inicial: {fmt(cajaActiva.monto_inicial)}
                        </span>
                    </div>
                </div>
            ) : (
                <>
                    {error && <div className={styles.error}>{error}</div>}
                    {exito && <div className={styles.success}>{exito}</div>}

                    {!exito && (
                        <div className={styles.formCard}>
                            <h2 className={styles.sectionTitle}>Nueva apertura</h2>
                            <div className={styles.formCol}>
                                <div className={styles.field}>
                                    <label>Monto inicial en caja *</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={monto}
                                        onChange={e => setMonto(e.target.value)}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Observaciones</label>
                                    <input
                                        type="text"
                                        placeholder="Opcional"
                                        value={obs}
                                        onChange={e => setObs(e.target.value)}
                                    />
                                </div>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={handleAbrir}
                                    disabled={saving}
                                >
                                    {saving ? 'Abriendo...' : 'Abrir caja'}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Historial de cajas</h2>
                {historial.length === 0 ? (
                    <div className={styles.empty}>No hay cajas registradas.</div>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Apertura</th>
                                    <th>Cierre</th>
                                    <th>Monto inicial</th>
                                    <th>Monto final</th>
                                    <th>Usuario</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map(c => (
                                    <tr key={c.id}>
                                        <td className={styles.idCell}>#{c.id}</td>
                                        <td>{fmtFecha(c.fecha_apertura)}</td>
                                        <td>{c.fecha_cierre ? fmtFecha(c.fecha_cierre) : '—'}</td>
                                        <td>{fmt(c.monto_inicial)}</td>
                                        <td>{c.monto_final != null ? fmt(c.monto_final) : '—'}</td>
                                        <td>{c.usuario_nombre || '—'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${c.estado === 'abierta' ? styles.badgeGreen : styles.badgeGray}`}>
                                                {c.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CajaPage