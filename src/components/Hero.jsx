import Icon from './Icon.jsx'

const formatToman = amount => new Intl.NumberFormat('fa-IR').format(amount)

export default function Hero({ query, setQuery, district, setDistrict, districts, budget, setBudget, onSearch }) {
  return (
    <section className="hero" id="top">
      <div className="hero-glow hero-glow-one" />
      <div className="hero-glow hero-glow-two" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span>کم‌هزینه‌تر تعمیر کن</span> قبل از تعویض، تعمیرش کن.</div>
          <h1>تعمیرکار مطمئن را <em>نزدیک خودت پیدا کن.</em></h1>
          <p className="hero-lead">
            فعلاً در مناطق ۱، ۲، ۳، ۴ و ۸ تهران. تعمیرکارها را مقایسه کن، حدود قیمت را ببین و مناسب‌ترین گزینه را انتخاب کن.
          </p>

          <form className="search-panel" onSubmit={onSearch}>
            <label className="search-field">
              <Icon name="search" size={19} />
              <span className="sr-only">چه چیزی نیاز به تعمیر دارد؟</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="چی خراب شده؟ مثلاً لباسشویی"
              />
            </label>
            <span className="search-divider" />
            <label className="search-field location-field">
              <Icon name="location" size={19} />
              <span className="sr-only">منطقه تهران</span>
              <select value={district} onChange={e => setDistrict(e.target.value)}>
                <option value="">انتخاب منطقه تهران</option>
                {districts.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <button className="btn btn-primary search-button" type="submit">
              جستجو <Icon name="arrow" size={18} />
            </button>
          </form>

          <div className="budget-row" aria-label="فیلتر بودجه">
            <span className="budget-label">بودجه تقریبی:</span>
            {[500000, 1000000, 2000000].map(amount => (
              <button
                type="button"
                className={`budget-chip ${budget === amount ? 'active' : ''}`}
                key={amount}
                onClick={() => setBudget(budget === amount ? null : amount)}
              >
                تا {formatToman(amount)} تومان
              </button>
            ))}
          </div>

          <div className="trust-row"><span><Icon name="shield" size={17} /> اطلاعات هر تعمیرگاه از منبع خود نمایش داده می‌شود</span><span><Icon name="check" size={17} /> مقایسه قبل از تماس</span></div>
        </div>

        <div className="hero-visual" aria-label="نمونه نتیجه تعمیرکار اقتصادی">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="repair-illustration">
            <div className="illustration-topline">
              <div className="tiny-brand-mark"><Icon name="tool" size={20} /></div>
              <span>پیشنهاد هوشمند</span>
              <span className="live-dot">تهران</span>
            </div>
            <div className="appliance-drawing">
              <div className="washer">
                <div className="washer-controls"><span/><span/><span/></div>
                <div className="washer-door"><div className="washer-glass">🧦</div></div>
              </div>
              <div className="tool-bubble">🔧</div>
            </div>
            <div className="match-card" aria-label="نمونه برای توضیح نحوه مقایسه">
              <div>
                <span className="match-kicker">نمونه برای توضیح نحوه مقایسه</span>
                <strong>قیمت و امتیاز فقط وقتی نمایش داده می‌شوند که ثبت شده باشند</strong>
              </div>
              <div className="rating-pill"><Icon name="star" size={13} filled /> نمونه</div>
            </div>
          </div>
          <div className="floating-card floating-price"><span>💸</span><div><small>قیمت‌ها را مقایسه کن</small><strong>قبل از انتخاب</strong></div></div>
          <div className="floating-card floating-time"><span>📍</span><div><small>پوشش فعلی</small><strong>۵ منطقه تهران</strong></div></div>
        </div>
      </div>
    </section>
  )
}
