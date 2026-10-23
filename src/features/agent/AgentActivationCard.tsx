import { useEffect, useState } from 'react'
import { api } from '../../infrastructure/composition'
import type { AgentActivationCode } from '../../domain/models'

function secondsUntil(value: string): number {
  return Math.max(0, Math.ceil((Date.parse(value) - Date.now()) / 1000))
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function AgentActivationCard() {
  const [activation, setActivation] = useState<AgentActivationCode | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!activation) return
    const interval = window.setInterval(() => setRemaining(secondsUntil(activation.expires_at)), 1000)
    return () => window.clearInterval(interval)
  }, [activation])

  async function issueCode() {
    setLoading(true)
    setError('')
    setCopied(false)
    try {
      const nextActivation = await api.issueAgentActivationCode()
      setActivation(nextActivation)
      setRemaining(secondsUntil(nextActivation.expires_at))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo generar la clave de activación')
    } finally {
      setLoading(false)
    }
  }

  async function copyCode() {
    if (!activation || remaining === 0) return
    try {
      await navigator.clipboard.writeText(activation.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('No se pudo copiar la clave. Puedes compartirla manualmente.')
    }
  }

  const expired = Boolean(activation && remaining === 0)

  return (
    <section className="agent-activation-card surface" aria-labelledby="agent-activation-title">
      <div className="agent-activation-copy">
        <p className="eyebrow">Acceso de confianza</p>
        <h2 id="agent-activation-title">Activa tu agente personal</h2>
        <p>Genera una clave temporal y compártela junto con tu documento y EPS para que el agente pueda ayudarte con tus servicios.</p>
        <ul className="agent-activation-rules">
          <li><span>✓</span>Una clave por activación, válida durante 5 minutos.</li>
          <li><span>✓</span>Solo permite operaciones sobre tu propia información.</li>
          <li><span>!</span>No compartas claves vencidas ni contraseñas de Confianza.</li>
        </ul>
      </div>
      <div className="agent-activation-action">
        <span className="agent-activation-label">Clave de activación</span>
        <strong className={`agent-activation-code ${expired ? 'expired' : ''}`} aria-live="polite">
          {activation && !expired ? activation.code : '------'}
        </strong>
        <span className="agent-activation-countdown">
          {activation && !expired ? `Vence en ${formatCountdown(remaining)}` : activation ? 'Clave vencida' : 'Aún no has generado una clave'}
        </span>
        {error && <p className="agent-activation-error" role="alert">{error}</p>}
        <div className="agent-activation-buttons">
          <button className="button button-primary" onClick={() => void issueCode()} disabled={loading}>
            {loading ? 'Generando…' : activation ? 'Generar nueva clave' : 'Generar clave'}
          </button>
          {activation && !expired && <button className="button button-secondary" onClick={() => void copyCode()}>{copied ? 'Clave copiada' : 'Copiar clave'} <span>↗</span></button>}
        </div>
        <small>La clave se muestra una sola vez y se invalida cuando se usa.</small>
      </div>
    </section>
  )
}
