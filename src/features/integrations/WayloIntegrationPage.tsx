import { useCallback, useEffect, useState } from 'react'
import { ErrorState, PageHeader } from '../../components/ui'
import type { WayloCode } from '../../domain/models'
import { api } from '../../infrastructure/composition'

function secondsUntil(value: string): number {
  return Math.max(0, Math.ceil((Date.parse(value) - Date.now()) / 1000))
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function WayloIntegrationPage() {
  const [wayloCode, setWayloCode] = useState<WayloCode | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const loadCode = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const nextCode = await api.wayloCode()
      setWayloCode(nextCode)
      setRemaining(secondsUntil(nextCode.expires_at))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar el código Waylo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadCode() }, [loadCode])

  useEffect(() => {
    if (!wayloCode) return
    const interval = window.setInterval(() => setRemaining(secondsUntil(wayloCode.expires_at)), 1000)
    const timeout = window.setTimeout(() => void loadCode(), Math.max(0, Date.parse(wayloCode.expires_at) - Date.now() + 100))
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [loadCode, wayloCode])

  async function copyCode() {
    if (!wayloCode) return
    await navigator.clipboard.writeText(wayloCode.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <>
    <PageHeader
      eyebrow="Acceso de integración"
      title="Waylo"
      subtitle="Un código temporal para que el agente consulte el perfil administrativo y las citas del paciente autorizado."
      action={<button className="button button-secondary" onClick={() => void loadCode()} disabled={loading}>{loading ? 'Actualizando…' : 'Actualizar código'}</button>}
    />
    {error ? <ErrorState message={error} onRetry={() => void loadCode()} /> : <section className="waylo-layout">
      <article className="surface waylo-code-card">
        <div className="waylo-card-heading"><div><p className="eyebrow">Código vigente</p><h2>Autenticación temporal</h2></div><span className="status-badge success"><i aria-hidden="true" />Activo</span></div>
        <div className="waylo-code-display" aria-live="polite">{loading ? '••••••' : wayloCode?.code ?? '------'}</div>
        <div className="waylo-code-meta"><span>Vence en</span><strong>{wayloCode ? formatCountdown(remaining) : '--:--'}</strong><small>La ventana se renueva automáticamente cada {wayloCode?.interval_seconds ?? 60} segundos.</small></div>
        <button className="button button-primary" onClick={() => void copyCode()} disabled={loading || !wayloCode}>{copied ? 'Código copiado' : 'Copiar código'} <span>↗</span></button>
      </article>
      <aside className="rule-panel waylo-rule-panel"><p className="eyebrow">Contrato seguro</p><h2>Comparte solo lo necesario.</h2><ul><li><span className="rule-icon">✓</span><span>Waylo combina este código con <strong>full_name</strong> y <strong>email</strong>.</span></li><li><span className="rule-icon">✓</span><span>El token dura 15 minutos y solo permite lecturas dedicadas.</span></li><li><span className="rule-icon">!</span><span>No compartas el secreto TOTP: nunca aparece en esta pantalla.</span></li></ul><div className="rule-foot"><span>Endpoint de intercambio</span><strong>POST /api/v1/integrations/waylo/token</strong></div></aside>
    </section>}
  </>
}
