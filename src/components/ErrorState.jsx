import { persianErrorMessage } from '../domain/errors.js'

export default function ErrorState({ error, onRetry }) {
  return <section className="resource-state resource-error" role="alert"><h2>دریافت اطلاعات ممکن نشد</h2><p>{persianErrorMessage(error, 'لطفاً دوباره تلاش کنید.')}</p>{onRetry && <button className="btn btn-primary" onClick={onRetry}>تلاش دوباره</button>}</section>
}
