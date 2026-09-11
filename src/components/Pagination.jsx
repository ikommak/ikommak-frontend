export default function Pagination({ pagination, onPage, ariaLabel = 'صفحه‌بندی نتایج' }) {
  if (!pagination || pagination.totalPages < 2) return null
  return <nav className="pagination" aria-label={ariaLabel}><button disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}>صفحه قبل</button><span>صفحه {pagination.page} از {pagination.totalPages}</span><button disabled={pagination.page >= pagination.totalPages} onClick={() => onPage(pagination.page + 1)}>صفحه بعد</button></nav>
}
