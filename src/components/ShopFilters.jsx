export default function ShopFilters({ filters, categories, districts, onChange }) {
  return <form className="shop-filters" onSubmit={event => { event.preventDefault(); onChange({}) }}>
    <label>جستجو<input value={filters.q} onChange={event => onChange({ q: event.target.value })} placeholder="نام یا نوع تعمیر" /></label>
    <label>منطقه<select value={filters.district} onChange={event => onChange({ district: event.target.value })}><option value="">همه مناطق</option>{districts.map(district => <option value={district.id} key={district.id}>{district.name}</option>)}</select></label>
    <label>دسته‌بندی<select value={filters.category} onChange={event => onChange({ category: event.target.value })}><option value="">همه دسته‌ها</option>{categories.map(category => <option value={category.slug} key={category.id}>{category.name}</option>)}</select></label>
    <label>مرتب‌سازی<select value={filters.sort} onChange={event => onChange({ sort: event.target.value })}><option value="recommended">پیشنهادی</option><option value="rating">بالاترین امتیاز</option><option value="newest">جدیدترین</option><option value="name">نام تعمیرگاه</option></select></label>
  </form>
}
