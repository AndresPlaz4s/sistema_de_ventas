import { useState } from 'react'
import api from '../../api/axios'
import styles from './ModalAbrirCaja.module.css'

function ModalAbrirCaja({ onCerrar }) {
    const [monto, setMonto] = useState('')
    const [obs, setObs] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

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
            onCerrar()
        } catch (err) {
            setError(err.response?.data?.error || 'Error abriendo caja.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>

                <div className={styles.modalTop}>
                    <div className={styles.iconWrap}>🏪</div>
                    <h2 className={styles.title}>Abrir caja</h2>
                    <p className={styles.sub}>No hay caja abierta. Registra el monto inicial para comenzar tu turno.</p>
                </div>

                <div className={styles.modalBody}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label>Monto inicial en caja *</label>
                        <input
                            type="number"
                            placeholder="$ 0"
                            value={monto}
                            onChange={e => setMonto(e.target.value)}
                            autoFocus
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
                        className={styles.btn}
                        onClick={handleAbrir}
                        disabled={saving}
                    >
                        {saving ? 'Abriendo...' : 'Abrir caja y continuar'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ModalAbrirCaja