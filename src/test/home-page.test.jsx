import { screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderAt, setupUser } from './helpers.jsx'

const source = {
  isDemo: false,
  listCategories: vi.fn(),
  listDistricts: vi.fn(),
  listShops: vi.fn(),
}

vi.mock('../data/mockApi.js', () => ({ dataSource: () => source }))

beforeEach(() => {
  source.listCategories.mockResolvedValue([{ id: '6', slug: 'watch-jewelry', name: 'ساعت و زیورآلات', iconKey: null, description: null }])
  source.listDistricts.mockResolvedValue([{ id: '3', city: 'تهران', name: 'منطقه ۳ تهران', slug: 'tehran-3' }])
  source.listShops.mockResolvedValue({ data: [{ id: '4', name: 'ساعت‌سازی نمونه', initials: 'سن', phone: null, address: null, district: { id: '3', name: 'منطقه ۳ تهران' }, categories: [{ id: '6', slug: 'watch-jewelry', name: 'ساعت و زیورآلات' }], services: [], location: { latitude: null, longitude: null, googleMapsUrl: null }, googleRating: 4.6, googleReviewCount: 12, reservationEnabled: true, createdAt: null }], pagination: { page: 1, limit: 6, total: 1, totalPages: 1 } })
})

it('loads taxonomy and recommended shops, then navigates submitted filters to the directory', async () => {
  const user = setupUser()
  const { router } = renderAt('/')

  expect(await screen.findByText('ساعت‌سازی نمونه')).toBeInTheDocument()
  expect(source.listShops).toHaveBeenCalledWith({ sort: 'recommended', limit: 6 }, expect.any(AbortSignal))
  await user.type(screen.getByPlaceholderText('چی خراب شده؟ مثلاً لباسشویی'), 'ساعت')
  await user.selectOptions(screen.getByLabelText('منطقه تهران'), '3')
  await user.click(screen.getByRole('button', { name: /جستجو/ }))

  expect(router.state.location.pathname).toBe('/shops')
  expect(router.state.location.search).toContain('q=%D8%B3%D8%A7%D8%B9%D8%AA')
  expect(router.state.location.search).toContain('district=3')
})

it('shows a retryable failure without substituting sample shops in API mode', async () => {
  source.listShops.mockRejectedValueOnce(Object.assign(new Error('private network detail'), { code: 'NETWORK_ERROR' }))
  renderAt('/')

  expect(await screen.findByRole('alert')).toHaveTextContent('ارتباط با سرور برقرار نشد.')
  expect(screen.getByRole('alert')).not.toHaveTextContent('private network detail')
  expect(screen.queryByText('تعمیرات خانه آریا')).not.toBeInTheDocument()
})
