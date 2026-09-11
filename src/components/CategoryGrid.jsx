import Icon from './Icon.jsx'

export default function CategoryGrid({ categories, activeCategory, onSelect }) {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <span className="section-kicker">خدمات پرکاربرد</span>
            <h2>چه چیزی نیاز به تعمیر دارد؟</h2>
          </div>
          <button className="text-link" onClick={() => onSelect(null)}>همه خدمات <Icon name="arrow" size={17} /></button>
        </div>

        <div className="category-grid">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-card ${activeCategory === category.slug ? 'active' : ''}`}
              onClick={() => onSelect(category.slug)}
            >
              <span className="category-icon">{category.icon ?? '🔧'}</span>
              <span className="category-copy">
                <strong>{category.name}</strong>
                <small>{category.note ?? 'برای دیدن تعمیرکارهای این دسته جستجو کنید'}</small>
              </span>
              <span className="category-arrow"><Icon name="chevron" size={17} /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
