export default function LoadingState({ label = 'در حال دریافت اطلاعات…' }) {
  return <div className="resource-state" role="status"><span className="loading-dot" aria-hidden="true" />{label}</div>
}
