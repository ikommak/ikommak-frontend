import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import CategoryGrid from '../components/CategoryGrid.jsx'
import RepairCard from '../components/RepairCard.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import Icon from '../components/Icon.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { dataSource } from '../data/mockApi.js'
import { presentShop, catalogPresentationBySlug } from '../data/catalogPresentation.js'
import { useApiResource } from '../hooks/useApiResource.js'

const formatNumber = value => new Intl.NumberFormat('fa-IR').format(value)

export default function HomePage() {
  const navigate = useNavigate()
  const source = dataSource()
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [budget, setBudget] = useState(null)
  const categories = useApiResource(signal => source.listCategories(signal), [])
  const districts = useApiResource(signal => source.listDistricts(signal), [])
  const recommended = useApiResource(signal => source.listShops({ sort: 'recommended', limit: 6 }, signal), [])

  const goToDirectory = values => {
    const params = new URLSearchParams()
    if (values.q?.trim()) params.set('q', values.q.trim())
    if (values.district) params.set('district', values.district)
    if (values.category) params.set('category', values.category)
    navigate(`/shops${params.size ? `?${params}` : ''}`)
  }
  const handleSearch = event => { event.preventDefault(); goToDirectory({ q: query, district }) }
  const categoryItems = (categories.data || []).map(category => ({ ...category, ...catalogPresentationBySlug[category.slug] }))
  const districtItems = districts.data || []
  const shops = (recommended.data?.data || []).map(presentShop)
  const loading = categories.loading || districts.loading || recommended.loading
  const error = categories.error || districts.error || recommended.error
  const selectedDistrict = districtItems.find(item => item.id === district)

  return <main>
    <Hero query={query} setQuery={setQuery} district={district} setDistrict={setDistrict} districts={districtItems} budget={budget} setBudget={setBudget} onSearch={handleSearch} />
    <div className="proof-strip"><div className="container proof-inner"><span><strong>رایگان</strong> برای جستجو</span><span className="proof-dot" /><span><strong>مخصوص تهران</strong> در شروع کار</span><span className="proof-dot" /><span><strong>۵ منطقه</strong> تحت پوشش فعلی</span></div></div>
    {categories.data && <CategoryGrid categories={categoryItems} activeCategory={null} onSelect={category => goToDirectory({ category })} />}
    <section className="section coverage-section" id="areas"><div className="container coverage-card"><div className="coverage-copy"><span className="section-kicker">محدوده فعالیت فعلی</span><h2>فعلاً فقط در ۵ منطقه تهران</h2><p>برای نسخه اول، نتایج فقط از مناطق ۱، ۲، ۳، ۴ و ۸ نمایش داده می‌شوند.</p></div><div className="district-grid">{districtItems.map(item => <button key={item.id} className={`district-tile ${district === item.id ? 'active' : ''}`} onClick={() => goToDirectory({ district: item.id })}><span>منطقه</span><strong>{formatNumber(item.id)}</strong><small>تهران</small></button>)}</div></div></section>
    <section className="section results-section" id="nearby"><div className="container"><div className="section-heading split-heading results-heading"><div><span className="section-kicker">تعمیرکارهای پیشنهادی</span><h2>برای مقایسه، اطلاعات واقعی را ببینید</h2><p>{selectedDistrict ? `نتایج کامل ${selectedDistrict.name} را در فهرست ببینید.` : 'برای جستجوی دقیق‌تر، منطقه یا نوع تعمیر را انتخاب کنید.'}</p></div></div>{loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => { categories.retry(); districts.retry(); recommended.retry() }} /> : shops.length ? <div className="repair-grid">{shops.map(shop => <RepairCard shop={shop} key={shop.id} />)}</div> : <EmptyState title="هنوز تعمیرگاهی برای نمایش نداریم" description="پس از اضافه‌شدن داده‌های معتبر، پیشنهادها در این بخش نمایش داده می‌شوند." />}{source.isDemo && <div className="demo-note"><Icon name="shield" size={17} /><span><strong>حالت نمونه فعال است.</strong> این داده‌ها فقط برای توسعه و نمایش هستند.</span></div>}</div></section>
    <section className="savings-section"><div className="container savings-card"><div className="savings-copy"><span className="section-kicker light">نمونه برای توضیح نحوه مقایسه</span><h2>قبل از خرج کردن، گزینه‌ها را مقایسه کن.</h2><p>قیمت‌های این بخش صرفاً مثال هستند. قیمت هر تعمیرگاه فقط در صورت ثبت‌شدن نمایش داده می‌شود.</p><div className="saving-points"><span><Icon name="check" size={17} /> چند تعمیرکار را با هم مقایسه کن</span><span><Icon name="check" size={17} /> قبل از تماس، جزئیات را بخوان</span></div></div><div className="quote-stack"><div className="quote-card muted"><span>گزینه الف</span><strong>۱,۴۰۰,۰۰۰</strong></div><div className="quote-card selected"><div><span>گزینه ب</span><small>مثال</small></div><strong>۸۵۰,۰۰۰</strong></div><div className="quote-card muted"><span>گزینه ج</span><strong>۱,۱۰۰,۰۰۰</strong></div></div></div></section>
    <HowItWorks />
    <section className="section shop-cta-section" id="shops"><div className="container shop-cta"><div className="shop-cta-icon"><Icon name="tool" size={32} /></div><div className="shop-cta-copy"><span className="section-kicker">برای تعمیرکارها و تعمیرگاه‌ها</span><h2>در یکی از مناطق تحت پوشش فعالیت می‌کنی؟</h2><p>ثبت کسب‌وکار در نسخه بعدی در دسترس قرار می‌گیرد.</p></div><button className="btn btn-primary btn-large" disabled>به‌زودی</button></div></section>
  </main>
}
