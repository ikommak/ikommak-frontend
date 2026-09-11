export default function EmptyState({ title = 'نتیجه‌ای پیدا نشد', description = 'فیلترها یا عبارت جستجو را تغییر دهید.', action = null }) {
  return <section className="resource-state resource-empty"><h2>{title}</h2><p>{description}</p>{action}</section>
}
