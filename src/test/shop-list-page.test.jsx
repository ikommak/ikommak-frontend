import { screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderAt, setupUser } from './helpers.jsx'

const source = { isDemo: false, listCategories: vi.fn(), listDistricts: vi.fn(), listShops: vi.fn() }
vi.mock('../data/mockApi.js', () => ({ dataSource: () => source }))

beforeEach(() => {
  source.listCategories.mockResolvedValue([{ id: '5', slug: 'shoes-bags-clothing', name: 'کفش، کیف و پوشاک' }])
  source.listDistricts.mockResolvedValue([{ id: '2', city: 'تهران', name: 'منطقه ۲ تهران', slug: 'tehran-2' }])
  source.listShops.mockResolvedValue({ data: [{ id: '8', name: 'کفاشی نمونه', initials: 'کن', phone: null, address: 'تهران', district: { id: '2', name: 'منطقه ۲ تهران' }, categories: [{ id: '5', slug: 'shoes-bags-clothing', name: 'کفش، کیف و پوشاک' }], services: [], location: { latitude: null, longitude: null, googleMapsUrl: null }, googleRating: null, googleReviewCount: null, reservationEnabled: true, createdAt: null }], pagination: { page: 2, limit: 20, total: 21, totalPages: 2 } })
})

it('uses normalized URL filters when loading the server-backed directory', async () => {
  renderAt('/shops?q=%D9%83%D9%81%D8%B4&district=2&category=shoes-bags-clothing&sort=rating&page=2')

  expect(await screen.findByText('کفاشی نمونه')).toBeInTheDocument()
  await waitFor(() => expect(source.listShops).toHaveBeenCalledWith({ q: 'کفش', district: '2', category: 'shoes-bags-clothing', sort: 'rating', page: '2', limit: 20 }, expect.any(AbortSignal)))
  expect(screen.getByText('۲۱ نتیجه')).toBeInTheDocument()
})

it('shows applied filters and clears one while preserving the other URL filters', async () => {
  const user = setupUser()
  const { router } = renderAt('/shops?q=%D9%83%D9%81%D8%B4&district=2&category=shoes-bags-clothing&sort=rating&page=2')

  expect(await screen.findByRole('button', { name: 'حذف جستجو: کفش' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'حذف منطقه: منطقه ۲ تهران' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'حذف دسته‌بندی: کفش، کیف و پوشاک' })).toBeVisible()
  expect(screen.getByRole('button', { name: 'حذف مرتب‌سازی: بالاترین امتیاز' })).toBeVisible()

  await user.click(screen.getByRole('button', { name: 'حذف جستجو: کفش' }))

  expect(router.state.location.search).not.toContain('q=')
  expect(router.state.location.search).not.toContain('page=')
  expect(router.state.location.search).toContain('district=2')
  expect(router.state.location.search).toContain('category=shoes-bags-clothing')
  expect(router.state.location.search).toContain('sort=rating')
})

it('clears every applied directory filter with one action', async () => {
  const user = setupUser()
  const { router } = renderAt('/shops?q=%DA%A9%D9%81%D8%B4&district=2&category=shoes-bags-clothing&sort=rating&favorites=1&page=2')

  await user.click(await screen.findByRole('button', { name: 'پاک‌کردن همه فیلترها' }))

  expect(router.state.location.pathname).toBe('/shops')
  expect(router.state.location.search).toBe('')
})

it('restores URL-backed filters when navigating back', async () => {
  const user = setupUser()
  const { router } = renderAt('/shops?district=2')

  await user.click(await screen.findByRole('button', { name: 'حذف منطقه: منطقه ۲ تهران' }))
  expect(router.state.location.search).toBe('')

  await router.navigate(-1)

  expect(await screen.findByRole('button', { name: 'حذف منطقه: منطقه ۲ تهران' })).toBeVisible()
  expect(router.state.location.search).toBe('?district=2')
})
