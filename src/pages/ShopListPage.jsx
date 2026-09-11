import { useSearchParams } from 'react-router-dom'
import ShopFilters from '../components/ShopFilters.jsx'
import ActiveFilterChips from '../components/ActiveFilterChips.jsx'
import ShopCard from '../components/ShopCard.jsx'
import Pagination from '../components/Pagination.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { dataSource } from '../data/mockApi.js'
import { useApiResource } from '../hooks/useApiResource.js'
import { useFavorites } from '../hooks/useFavorites.js'
import { normalizePersian } from '../domain/format.js'

function readFilters(search) {
  const integer = value => /^[1-9]\d*$/u.test(value || '') ? value : ''
  const sort = ['recommended', 'rating', 'newest', 'name'].includes(search.get('sort')) ? search.get('sort') : 'recommended'
  return { q: normalizePersian(search.get('q') || ''), district: integer(search.get('district')), category: /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(search.get('category') || '') ? search.get('category') : '', sort, page: integer(search.get('page')) || '1', favorites: search.get('favorites') === '1' }
}

export default function ShopListPage() {
  const source = dataSource()
  const [search, setSearch] = useSearchParams()
  const filters = readFilters(search)
  const { ids, has, toggle, prune } = useFavorites()
  const categories = useApiResource(signal => source.listCategories(signal), [])
  const districts = useApiResource(signal => source.listDistricts(signal), [])
  const shops = useApiResource(signal => {
    if (filters.favorites && ids.length === 0) return Promise.resolve({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
    const request = { sort: filters.sort, page: filters.page, limit: 20, ...(filters.q ? { q: filters.q } : {}), ...(filters.district ? { district: filters.district } : {}), ...(filters.category ? { category: filters.category } : {}), ...(filters.favorites ? { ids } : {}) }
    return source.listShops(request, signal)
  }, [filters.q, filters.district, filters.category, filters.sort, filters.page, filters.favorites, ids.join(',')])

  const update = patch => {
    const next = { ...filters, ...patch }
    if (!Object.hasOwn(patch, 'page')) next.page = '1'
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    if (next.district) params.set('district', next.district)
    if (next.category) params.set('category', next.category)
    if (next.sort !== 'recommended') params.set('sort', next.sort)
    if (next.page !== '1') params.set('page', next.page)
    if (next.favorites) params.set('favorites', '1')
    setSearch(params)
  }
  const rows = shops.data?.data || []
  const pagination = shops.data?.pagination
  const error = categories.error || districts.error || shops.error

  return <main className="directory-page"><div className="container"><header className="directory-heading"><span className="section-kicker">فهرست تعمیرکارها</span><h1>تعمیرکار موردنیازتان را پیدا کنید</h1><p>فقط اطلاعات ثبت‌شده هر تعمیرگاه نمایش داده می‌شود.</p></header><ShopFilters filters={filters} categories={categories.data || []} districts={districts.data || []} onChange={update} /><label className="favorites-toggle"><input type="checkbox" checked={filters.favorites} onChange={event => update({ favorites: event.target.checked })} /> فقط علاقه‌مندی‌ها</label><ActiveFilterChips filters={filters} categories={categories.data || []} districts={districts.data || []} onChange={update} />{categories.loading || districts.loading || shops.loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => { categories.retry(); districts.retry(); shops.retry() }} /> : filters.favorites && !ids.length ? <EmptyState title="علاقه‌مندی ندارید" description="با ستاره‌زدن یک تعمیرگاه، آن را برای بعد ذخیره کنید." /> : <><p className="result-count">{new Intl.NumberFormat('fa-IR').format(pagination?.total || 0)} نتیجه</p>{rows.length ? <div className="shop-list-grid">{rows.map(shop => <ShopCard shop={shop} key={shop.id} favorite={has(shop.id)} onToggleFavorite={id => { toggle(id); if (filters.favorites) prune(ids.filter(item => item !== id)) }} />)}</div> : <EmptyState />}<Pagination pagination={pagination} onPage={page => update({ page: String(page) })} /></>}</div></main>
}
