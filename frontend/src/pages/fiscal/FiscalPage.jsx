import { useEffect, useState } from 'react'
import api from '../../api/axios'
import styles from './FiscalPage.module.css'

function FiscalPage() {
    const [config, setConfig]   = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving]   = useState(false)
    const [error, setError]     = useState(null)
    const [exito, setExito]     = useState(null)

    const [iva, setIva]                   = useState('')
    const [descuento, setDescuento]       = useState('')

    const fetchConfig = async () => {
        setLoading(true)
        try {
            const res = await api.get('/fiscal/activa/')
            setConfig(res.data)
            setIva(res.data.iva ?? 0)
            setDescuento(res.data.descuento_maximo ?? 0)
        } catch {
            setError('Error cargando configuración fiscal.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchConfig() }, [])

    const handleGuardar = async () => {
        if (parseFloat(iva) < 0 || parseFloat(iva) > 100) {
            setError('El IVA debe estar entre 0 y 100.')
            return
        }
        if (parseFloat(descuento) < 0 || parseFloat(descuento) > 100) {
            setError('El descuento máximo debe estar entre 0 y 100.')
            return
        }
        setSaving(true)
        setError(null)
        setExito(null)
        try {
            await api.post('/fiscal/actualizar/', {
                iva: parseFloat(iva),
                descuento_maximo: parseFloat(descuento),
                activo: true,
            })
            setExito('Configuración guardada correctamente.')
            fetchConfig()
        } catch (err) {
            setError(err.response?.data?.detail || 'Error guardando configuración.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Configuración fiscal</h1>
                    <p className={styles.sub}>Define el IVA y descuentos que se aplicarán en todas las ventas</p>
                </div>
            </div>

            {loading ? (
                <div className={styles.empty}>Cargando...</div>
            ) : (
                <>
                    {error  && <div className={styles.error}>{error}</div>}
                    {exito  && <div className={styles.success}>{exito}</div>}

                    {/* Cards resumen */}
                    <div className={styles.resumenGrid}>
                        <div className={styles.resumenCard}>
                            <div className={styles.resumenIcon} style={{ background: '#eff6ff', color: '#2563eb' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <span className={styles.resumenLabel}>IVA actual</span>
                                <span className={styles.resumenValor}>{config?.iva ?? 0}%</span>
                            </div>
                        </div>
                        <div className={styles.resumenCard}>
                            <div className={styles.resumenIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 7h.01M17 17h.01M5 21L19 3" />
                                </svg>
                            </div>
                            <div>
                                <span className={styles.resumenLabel}>Descuento máximo</span>
                                <span className={styles.resumenValor}>{config?.descuento_maximo ?? 0}%</span>
                            </div>
                        </div>
                        <div className={styles.resumenCard}>
                            <div className={styles.resumenIcon} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <span className={styles.resumenLabel}>Estado</span>
                                <span className={styles.resumenValor} style={{ color: '#16a34a' }}>Activo</span>
                            </div>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className={styles.formCard}>
                        <h2 className={styles.formTitle}>Editar configuración</h2>
                        <p className={styles.formSub}>
                            Estos valores se aplicarán automáticamente en todas las ventas nuevas.
                        </p>

                        <div className={styles.formGrid}>
                            <div className={styles.field}>
                                <label>IVA (%)</label>
                                <div className={styles.inputWrap}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={iva}
                                        onChange={e => setIva(e.target.value)}
                                    />
                                    <span className={styles.inputSuffix}>%</span>
                                </div>
                                <span className={styles.fieldHint}>Ej: 19 para IVA del 19%</span>
                            </div>

                            <div className={styles.field}>
                                <label>Descuento máximo permitido (%)</label>
                                <div className={styles.inputWrap}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={descuento}
                                        onChange={e => setDescuento(e.target.value)}
                                    />
                                    <span className={styles.inputSuffix}>%</span>
                                </div>
                                <span className={styles.fieldHint}>Los vendedores no podrán superar este descuento</span>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className={styles.preview}>
                            <h3 className={styles.previewTitle}>Vista previa — venta de ejemplo $100.000</h3>
                            <div className={styles.previewRows}>
                                <div className={styles.previewRow}>
                                    <span>Subtotal</span>
                                    <span>$100.000</span>
                                </div>
                                <div className={styles.previewRow}>
                                    <span>IVA ({iva || 0}%)</span>
                                    <span>+${(100000 * parseFloat(iva || 0) / 100).toLocaleString('es-CO')}</span>
                                </div>
                                <div className={styles.previewRow}>
                                    <span>Descuento máx. ({descuento || 0}%)</span>
                                    <span>-${(100000 * parseFloat(descuento || 0) / 100).toLocaleString('es-CO')}</span>
                                </div>
                                <div className={`${styles.previewRow} ${styles.previewTotal}`}>
                                    <span>Total</span>
                                    <span>
                                        ${(100000 + 100000 * parseFloat(iva || 0) / 100 - 100000 * parseFloat(descuento || 0) / 100).toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            className={styles.btn}
                            onClick={handleGuardar}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar configuración'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default FiscalPage