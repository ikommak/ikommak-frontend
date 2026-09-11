const sortLabels = Object.freeze({
  rating: 'بالاترین امتیاز',
  newest: 'جدیدترین',
  name: 'نام تعمیرگاه',
})

export default function ActiveFilterChips({ filters, categories, districts, onChange }) {
  const chips = []
  if (filters.q) chips.push({ key: 'q', label: `جستجو: ${filters.q}`, clear: { q: '' } })
  if (filters.district) {
    const district = districts.find(item => String(item.id) === String(filters.district))
    chips.push({ key: 'district', label: `منطقه: ${district?.name || filters.district}`, clear: { district: '' } })
  }
  if (filters.category) {
    const category = categories.find(item => item.slug === filters.category)
    chips.push({ key: 'category', label: `دسته‌بندی: ${category?.name || filters.category}`, clear: { category: '' } })
  }
  if (filters.sort !== 'recommended') chips.push({ key: 'sort', label: `مرتب‌سازی: ${sortLabels[filters.sort]}`, clear: { sort: 'recommended' } })
  if (filters.favorites) chips.push({ key: 'favorites', label: 'فقط علاقه‌مندی‌ها', clear: { favorites: false } })
  if (!chips.length) return null

  return <div className="active-filters" aria-label="فیلترهای فعال">
    {chips.map(chip => <button key={chip.key} type="button" className="filter-chip" aria-label={`حذف ${chip.label}`} onClick={() => onChange(chip.clear)}><span>{chip.label}</span><span aria-hidden="true">×</span></button>)}
    <button type="button" className="clear-filters" onClick={() => onChange({ q: '', district: '', category: '', sort: 'recommended', page: '1', favorites: false })}>پاک‌کردن همه فیلترها</button>
  </div>
}
