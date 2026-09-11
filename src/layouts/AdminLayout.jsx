import { useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import { dataSource } from '../data/mockApi.js'
import { useApiResource } from '../hooks/useApiResource.js'

export default function AdminLayout() {
  const source = dataSource()
  const location = useLocation()
  const navigate = useNavigate()
  const session = useApiResource(signal => source.getAdminSession(signal), [])
  const [loggingOut, setLoggingOut] = useState(false)

  if (session.loading) return <AdminFrame><LoadingState label="در حال بررسی نشست مدیریت…" /></AdminFrame>
  if (isUnauthorized(session.error) || session.data?.authenticated === false) return <Navigate replace to="/admin/login" state={{ from: location.pathname }} />
  if (session.error) return <AdminFrame><ErrorState error={session.error} onRetry={session.retry} /></AdminFrame>

  const onUnauthorized = error => {
    if (!isUnauthorized(error)) return false
    navigate('/admin/login', { replace: true, state: { from: location.pathname } })
    return true
  }
  const logout = async () => {
    setLoggingOut(true)
    try { await source.logoutAdmin() } finally { navigate('/admin/login', { replace: true }) }
  }

  return <div className="admin-shell"><a className="skip-link" href="#admin-content">رفتن به محتوای مدیریت</a><header className="admin-header"><a href="/" className="admin-brand"><img src="/ikommak-logo.png" alt="Ikommak" /></a><div><span>{session.data?.username}</span><button className="btn btn-ghost" onClick={logout} disabled={loggingOut}>{loggingOut ? 'در حال خروج…' : 'خروج'}</button></div></header><div id="admin-content" tabIndex="-1"><Outlet context={{ source, onUnauthorized }} /></div></div>
}

function AdminFrame({ children }) { return <main className="admin-state"><h1 className="visually-hidden">مدیریت آیکمک</h1>{children}</main> }
function isUnauthorized(error) { return error?.status === 401 || ['AUTH_REQUIRED', 'UNAUTHENTICATED'].includes(error?.code) }
