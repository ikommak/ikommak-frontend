import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { dataSource } from '../data/mockApi.js'

export default function AdminLoginPage() {
  const source = dataSource()
  const location = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async event => {
    event.preventDefault()
    if (!username || !password) { setError('نام کاربری و رمز عبور را وارد کنید.'); return }
    setSubmitting(true); setError('')
    try {
      const session = await source.loginAdmin({ username, password })
      if (!session.authenticated) throw new Error('AUTH_INVALID')
      const requested = location.state?.from
      navigate(typeof requested === 'string' && requested.startsWith('/admin') && requested !== '/admin/login' ? requested : '/admin', { replace: true })
    } catch {
      setError('نام کاربری یا رمز عبور نادرست است.')
    } finally { setSubmitting(false) }
  }

  return <><a className="skip-link" href="#admin-login-content">رفتن به فرم ورود مدیریت</a><main id="admin-login-content" tabIndex="-1" className="admin-login-page"><section className="admin-login-card"><a href="/" className="admin-login-brand"><img src="/ikommak-logo.png" alt="Ikommak" /></a><span className="section-kicker">بخش امن</span><h1>ورود مدیریت</h1><p>برای مدیریت نظرها و درخواست‌های رزرو وارد شوید.</p><form onSubmit={submit} noValidate><label>نام کاربری<input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" disabled={submitting} /></label><label>رمز عبور<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" disabled={submitting} /></label>{error ? <p className="form-error" role="alert">{error}</p> : null}<button className="btn btn-primary" disabled={submitting}>{submitting ? 'در حال ورود…' : 'ورود مدیر'}</button></form></section></main></>
}
