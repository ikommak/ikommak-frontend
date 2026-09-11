import { screen, within } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderAt, setupUser } from './helpers.jsx'

const source = { isDemo: false, getShop: vi.fn(), listReviews: vi.fn(), submitReview: vi.fn() }
vi.mock('../data/mockApi.js', () => ({ dataSource: () => source }))

beforeEach(() => {
  localStorage.clear()
  source.getShop.mockResolvedValue({ id: '4', name: 'ساعت‌سازی نمونه', initials: 'سن', phone: null, address: 'تهران، منطقه ۳', district: { id: '3', name: 'منطقه ۳ تهران' }, categories: [{ id: '6', slug: 'watch-jewelry', name: 'ساعت و زیورآلات' }], services: [], location: { latitude: null, longitude: null, googleMapsUrl: null }, googleRating: 4.5, googleReviewCount: 2, googleReviewsSummary: { rating: 4.5, reviewCount: 2 }, userReviewsSummary: { rating: 4, reviewCount: 1 }, reservationEnabled: true, createdAt: null })
  source.listReviews.mockImplementation((_id, sourceName, page) => Promise.resolve({ data: [{ id: `${sourceName}:${page}`, source: sourceName, authorName: 'مینا', rating: 4, comment: 'کار دقیق بود', originalDate: null, relativeTime: null, reviewedAt: null, createdAt: null }], pagination: { page, limit: 20, total: sourceName === 'google' ? 21 : 1, totalPages: sourceName === 'google' ? 2 : 1 } }))
})

it('keeps Google and Ikommak reviews visibly separate', async () => {
  renderAt('/shops/4')
  expect(await screen.findByRole('heading', { name: 'نظرات گوگل' })).toBeVisible()
  expect(screen.getByRole('heading', { name: 'نظرات کاربران آیکمک' })).toBeVisible()
  expect(screen.getByRole('region', { name: 'نظرات گوگل' })).toBeVisible()
  expect(screen.getByRole('region', { name: 'نظرات کاربران آیکمک' })).toBeVisible()
  expect(source.listReviews).toHaveBeenCalledWith('4', 'google', 1, expect.any(AbortSignal))
  expect(source.listReviews).toHaveBeenCalledWith('4', 'user', 1, expect.any(AbortSignal))
})

it('favorites the current shop and paginates Google reviews independently', async () => {
  const user = setupUser()
  renderAt('/shops/4')

  await user.click(await screen.findByRole('button', { name: 'افزودن به علاقه‌مندی‌ها' }))
  expect(JSON.parse(localStorage.getItem('ikommak.favoriteShopIds'))).toContain('4')

  const googleReviews = screen.getByRole('region', { name: 'نظرات گوگل' })
  await user.click(within(googleReviews).getByRole('button', { name: 'صفحه بعد' }))

  expect(source.listReviews).toHaveBeenCalledWith('4', 'google', 2, expect.any(AbortSignal))
  expect(source.listReviews).toHaveBeenCalledWith('4', 'user', 1, expect.any(AbortSignal))
})

it('disables unavailable mobile phone and map actions without inventing URLs', async () => {
  renderAt('/shops/4')
  await screen.findByText('ساعت‌سازی نمونه')

  const actions = screen.getByRole('group', { name: 'راه‌های ارتباط سریع' })
  expect(within(actions).getByRole('button', { name: 'تماس' })).toBeDisabled()
  expect(within(actions).getByRole('button', { name: 'نقشه' })).toBeDisabled()
  expect(within(actions).queryByRole('link', { name: 'تماس' })).not.toBeInTheDocument()
  expect(within(actions).queryByRole('link', { name: 'نقشه' })).not.toBeInTheDocument()
  expect(within(actions).getByRole('link', { name: 'درخواست رزرو' })).toHaveAttribute('href', '/shops/4/reserve')
})
