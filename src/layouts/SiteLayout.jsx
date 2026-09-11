import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'

export default function SiteLayout() {
  return <><a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a><Header /><div id="main-content" tabIndex="-1"><Outlet /></div><footer className="footer"><div className="container footer-main"><div className="footer-brand"><img src="/ikommak-logo.png" alt="Ikommak" /><p>راه ساده‌تر برای پیدا کردن تعمیرکار و مقایسه گزینه‌ها در تهران.</p></div><div className="footer-links"><div><strong>آیکمک</strong><a href="/#services">خدمات</a><a href="/#nearby">تعمیرکارها</a><a href="/#areas">مناطق تحت پوشش</a></div><div><strong>کسب‌وکارها</strong><a href="/#shops">ثبت تعمیرگاه</a></div><div><strong>راهنما</strong><a href="/#how">نحوه کار</a></div></div></div><div className="container footer-bottom"><span>© ۲۰۲۶ Ikommak</span><span>نسخه اولیه ویژه مناطق ۱، ۲، ۳، ۴ و ۸ تهران</span></div></footer></>
}
