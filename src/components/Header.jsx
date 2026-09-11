import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

export default function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const triggerRef = useRef(null)
  const navRef = useRef(null)
  const close = () => setOpen(false)
  const homeAnchor = hash => location.pathname === '/' ? hash : `/${hash}`

  useEffect(() => {
    if (!open) return undefined
    navRef.current?.querySelector('a')?.focus()
    const onKeyDown = event => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="صفحه اصلی آیکمک">
          <img src="/ikommak-logo.png" alt="Ikommak" />
        </Link>

        <nav ref={navRef} id="main-navigation" className={`main-nav ${open ? 'is-open' : ''}`} aria-label="منوی اصلی">
          <Link to={homeAnchor('#services')} onClick={close}>خدمات</Link>
          <Link to={homeAnchor('#nearby')} onClick={close}>تعمیرکارها</Link>
          <Link to={homeAnchor('#areas')} onClick={close}>مناطق تحت پوشش</Link>
          <Link to={homeAnchor('#how')} onClick={close}>چطور کار می‌کند؟</Link>
          <div className="mobile-nav-actions">
            <Link className="btn btn-ghost" to="/admin/login" onClick={close}>ورود مدیریت</Link>
            <Link className="btn btn-primary" to={homeAnchor('#shops')} onClick={close}>ثبت تعمیرگاه</Link>
          </div>
        </nav>

        <div className="header-actions">
          <Link className="btn btn-ghost" to="/admin/login">ورود مدیریت</Link>
          <Link className="btn btn-primary" to={homeAnchor('#shops')}>ثبت تعمیرگاه</Link>
        </div>

        <button
          ref={triggerRef}
          className="menu-button"
          aria-label={open ? 'بستن منو' : 'باز کردن منو'}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(v => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
    </header>
  )
}
