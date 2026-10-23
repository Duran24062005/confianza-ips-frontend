import type { ReactNode } from 'react'
import { useState } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ApiDocsDetail, ApiDocsIndex } from './docs/ApiDocsPage'
import { AppShell } from './components/layout/AppShell'
import type { Role, User } from './domain/models'
import { authenticationService } from './infrastructure/composition'
import { LoginScreen } from './features/auth/LoginScreen'
import { OverviewPage } from './features/dashboard/OverviewPage'
import { PatientsPage } from './features/patients/PatientsPage'
import { AgendaPage } from './features/agenda/AgendaPage'
import { ClinicalPage } from './features/clinical/ClinicalPage'
import { AuditPage } from './features/audit/AuditPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { PublicLandingPage } from './features/landing/PublicLandingPage'

function ProtectedRoute({ user, roles, children }: { user: User; roles?: Role[]; children: ReactNode }) {
  if (roles && !roles.includes(user.role)) return <Navigate to="/app/resumen" replace />
  return <>{children}</>
}

function DashboardApp({ user, onSignIn, booting, error, onSignOut, onClearError }: { user: User | null; onSignIn: (email: string, password: string) => void; booting: boolean; error: string; onSignOut: () => void; onClearError: () => void }) {
  if (!user) return <LoginScreen onSubmit={onSignIn} busy={booting} error={error} />
  return <AppShell user={user} onSignOut={onSignOut} error={error} onClearError={onClearError}><Outlet /></AppShell>
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [booting, setBooting] = useState(false)
  const [error, setError] = useState('')
  async function signIn(email: string, password: string) { setBooting(true); setError(''); try { setUser(await authenticationService.signIn(email, password)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible iniciar sesión') } finally { setBooting(false) } }
  async function signOut() { try { await authenticationService.signOut() } catch { /* La sesión local se limpia aunque el servidor no responda. */ } setUser(null); setError('') }
  return <Routes>
    <Route path="/" element={<PublicLandingPage />} />
    <Route path="/docs" element={<ApiDocsIndex />} />
    <Route path="/docs/:operationId" element={<ApiDocsDetail />} />
    <Route path="/app" element={<DashboardApp user={user} onSignIn={signIn} booting={booting} error={error} onSignOut={signOut} onClearError={() => setError('')} />}>
      <Route index element={<Navigate to="resumen" replace />} />
      <Route path="resumen" element={user ? <OverviewPage user={user} /> : <Navigate to="/" replace />} />
      <Route path="pacientes" element={user ? <ProtectedRoute user={user} roles={['admin', 'receptionist']}><PatientsPage onError={setError} /></ProtectedRoute> : null} />
      <Route path="agenda" element={user ? <AgendaPage user={user} onError={setError} /> : null} />
      <Route path="historia" element={user ? <ProtectedRoute user={user} roles={['doctor', 'patient']}><ClinicalPage user={user} onError={setError} /></ProtectedRoute> : null} />
      <Route path="auditoria" element={user ? <ProtectedRoute user={user} roles={['admin']}><AuditPage /></ProtectedRoute> : null} />
      <Route path="perfil" element={user ? <ProfilePage user={user} onUpdated={setUser} onError={setError} onSignOut={signOut} /> : null} />
    </Route>
    <Route path="*" element={user ? <Navigate to="/app/resumen" replace /> : <DashboardApp user={null} onSignIn={signIn} booting={booting} error={error} onSignOut={signOut} onClearError={() => setError('')} />} />
  </Routes>
}

export default App
