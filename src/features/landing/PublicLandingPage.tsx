import { Link } from 'react-router-dom'

const serviceCards = [
  {
    title: 'Pacientes en contexto',
    description: 'Consulta la información que cada rol necesita para continuar una atención sin repetir pasos.',
    tone: 'mint',
    mark: 'P',
  },
  {
    title: 'Agenda que conversa',
    description: 'Organiza citas, disponibilidad y seguimientos desde una misma vista de trabajo.',
    tone: 'blue',
    mark: 'A',
  },
  {
    title: 'Historia clínica clara',
    description: 'Reúne notas y decisiones clínicas con una lectura ordenada y responsable.',
    tone: 'paper',
    mark: 'H',
  },
  {
    title: 'Trazabilidad operativa',
    description: 'Cada cambio importante conserva quién lo hizo y en qué momento.',
    tone: 'navy',
    mark: 'T',
  },
  {
    title: 'Integraciones listas',
    description: 'Conecta servicios aliados cuando la operación necesita crecer sin perder el hilo.',
    tone: 'coral',
    mark: 'I',
  },
]

const processSteps = [
  ['Conecta', 'Centraliza pacientes, agenda y equipos en un espacio común.'],
  ['Coordina', 'Asigna responsabilidades y mantén visible el siguiente paso.'],
  ['Decide', 'Convierte la información ordenada en una atención más oportuna.'],
]

function BrandLockup({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`landing-brand ${light ? 'landing-brand-light' : ''}`} aria-label="Confianza IPS, inicio">
      <span className="landing-brand-mark"><img src="/brand/confianza-symbol.png" alt="" /></span>
      <span>
        <strong>confianza</strong>
        <small>IPS · salud organizada</small>
      </span>
    </Link>
  )
}

function Arrow() {
  return <span className="landing-arrow" aria-hidden="true">↗</span>
}

export function PublicLandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-demo-strip">
        <span>Entorno de demostración</span>
        <span>Información ficticia, sin datos médicos reales</span>
      </div>

      <header className="landing-header">
        <BrandLockup />
        <nav className="landing-main-nav" aria-label="Navegación pública">
          <a href="#plataforma">La plataforma</a>
          <a href="#recorrido">Cómo funciona</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <div className="landing-header-actions">
          <Link className="landing-text-link" to="/app">Iniciar sesión</Link>
          <Link className="landing-button landing-button-small" to="/app?mode=register">Crear cuenta <Arrow /></Link>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy landing-reveal">
          <p className="landing-eyebrow">Plataforma institucional de salud</p>
          <h1 id="landing-title">La salud organizada para cuidar mejor.</h1>
          <p className="landing-hero-summary">Un espacio claro para coordinar pacientes, citas y decisiones clínicas con trazabilidad.</p>
          <div className="landing-actions">
            <Link className="landing-button" to="/app">Iniciar sesión <Arrow /></Link>
            <Link className="landing-button landing-button-quiet" to="/app?mode=register">Crear cuenta <Arrow /></Link>
          </div>
          <div className="landing-hero-meta">
            <span className="landing-status-mark" aria-hidden="true" />
            <span>Diseñada para pacientes y equipos clínicos</span>
          </div>
        </div>
        <figure className="landing-hero-visual landing-reveal landing-reveal-delay">
          <img src="/landing/clinical-team-hero.png" alt="Médica y coordinadora revisan una tableta en una clínica luminosa" width="1536" height="1024" />
          <figcaption><span>Confianza IPS</span><span>Una vista común para cada equipo</span></figcaption>
        </figure>
      </section>

      <section className="landing-trust-line" aria-label="Áreas que conecta la plataforma">
        <span>Una operación conectada</span>
        <div className="landing-trust-items"><span>Pacientes</span><i /> <span>Clínica</span><i /> <span>Administración</span><i /> <span>Auditoría</span></div>
      </section>

      <section className="landing-section landing-platform-section" id="plataforma" aria-labelledby="platform-title">
        <div className="landing-section-heading landing-reveal">
          <p className="landing-eyebrow">La plataforma</p>
          <h2 id="platform-title">Todo el recorrido en un mismo lugar.</h2>
          <p>Confianza IPS reúne las tareas que suelen quedar separadas para que cada persona pueda concentrarse en lo importante.</p>
        </div>
        <div className="landing-services-grid">
          {serviceCards.map((card, index) => (
            <article className={`landing-service-card landing-service-${card.tone} landing-reveal landing-reveal-${index % 3}`} key={card.title}>
              <span className="landing-service-mark" aria-hidden="true">{card.mark}</span>
              <div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <Link to="/app" className="landing-card-link">Conocer la demo <Arrow /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-process" id="recorrido" aria-labelledby="process-title">
        <div className="landing-process-intro landing-reveal">
          <p className="landing-eyebrow">Un recorrido más simple</p>
          <h2 id="process-title">Menos ventanas. Más contexto.</h2>
          <p>La información se mueve con el equipo, no al revés.</p>
        </div>
        <ol className="landing-process-list">
          {processSteps.map(([title, description], index) => (
            <li className="landing-process-item landing-reveal" key={title}>
              <span className="landing-process-number">0{index + 1}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-care-section" aria-labelledby="care-title">
        <figure className="landing-care-visual landing-reveal">
          <img src="/landing/patient-care.png" alt="Paciente y profesional de salud revisan un plan de atención" width="1448" height="1086" loading="lazy" />
        </figure>
        <div className="landing-care-copy landing-reveal landing-reveal-delay">
          <p className="landing-eyebrow">Cuidado con contexto</p>
          <h2 id="care-title">La tecnología acompaña. El criterio sigue siendo humano.</h2>
          <p>La plataforma está pensada para que las decisiones tengan antecedentes, responsables y un siguiente paso visible.</p>
          <Link className="landing-outline-link" to="/docs">Explorar la documentación <Arrow /></Link>
        </div>
      </section>

      <section className="landing-proof-section" aria-labelledby="proof-title">
        <div className="landing-proof-heading landing-reveal">
          <p className="landing-eyebrow">Una base para crecer</p>
          <h2 id="proof-title">Hecha para el día a día de una IPS.</h2>
        </div>
        <div className="landing-proof-grid">
          <article><strong>4</strong><span>roles con una vista compartida</span></article>
          <article><strong>1</strong><span>agenda para coordinar el cuidado</span></article>
          <article><strong>24/7</strong><span>continuidad para consultar lo necesario</span></article>
        </div>
        <p className="landing-proof-note">Indicadores de ejemplo para esta demostración.</p>
      </section>

      <section className="landing-cta-section" id="contacto" aria-labelledby="cta-title">
        <div>
          <p className="landing-eyebrow">Listos para comenzar</p>
          <h2 id="cta-title">Una operación más clara empieza con una conversación.</h2>
        </div>
        <div className="landing-cta-actions">
          <Link className="landing-button landing-button-light" to="/app">Iniciar sesión <Arrow /></Link>
          <Link className="landing-light-link" to="/app?mode=register">Crear cuenta <Arrow /></Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand"><BrandLockup light /><p>Una plataforma ficticia para explorar una operación de salud más conectada.</p></div>
        <div className="landing-footer-column"><span>Plataforma</span><Link to="/">Inicio</Link><a href="#plataforma">Capacidades</a><Link to="/docs">Documentación API</Link></div>
        <div className="landing-footer-column"><span>Acceso</span><Link to="/app">Iniciar sesión</Link><Link to="/app?mode=register">Crear cuenta</Link><a href="#contacto">Contacto</a></div>
        <div className="landing-footer-note"><span>Confianza IPS</span><p>Este sitio usa información ficticia y no sustituye una historia clínica ni una recomendación profesional.</p></div>
      </footer>
    </main>
  )
}
