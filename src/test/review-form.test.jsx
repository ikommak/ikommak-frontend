import { screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderAt, setupUser } from './helpers.jsx'

const source = { isDemo: false, getShop: vi.fn(), listReviews: vi.fn(), submitReview: vi.fn() }
vi.mock('../data/mockApi.js', () => ({ dataSource: () => source }))

beforeEach(() => {
  source.getShop.mockResolvedValue({ id: '4', name: 'ساعت‌سازی نمونه', initials: 'سن', phone: null, address: null, district: null, categories: [], services: [], location: { latitude: null, longitude: null, googleMapsUrl: null }, googleRating: null, googleReviewCount: null, googleReviewsSummary: { rating: null, reviewCount: null }, userReviewsSummary: { rating: null, reviewCount: 0 }, reservationEnabled: true, createdAt: null })
  source.listReviews.mockResolvedValue({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
  source.submitReview.mockResolvedValue({ status: 'pending', message: 'نظر شما پس از بررسی منتشر می‌شود.' })
})

it('shows moderation confirmation after valid review submission', async () => {
  const user = setupUser()
  renderAt('/shops/4')
  await screen.findByText('ساعت‌سازی نمونه')
  await user.type(screen.getByLabelText('نام شما'), 'سارا')
  await user.selectOptions(screen.getByLabelText('امتیاز'), '4')
  await user.type(screen.getByLabelText('نظر شما'), 'برخورد خوب و تعمیر دقیق بود.')
  await user.click(screen.getByRole('button', { name: 'ارسال نظر' }))
  expect(await screen.findByText('نظر شما پس از بررسی منتشر می‌شود.')).toBeVisible()
  expect(source.submitReview).toHaveBeenCalledWith('4', { authorName: 'سارا', rating: 4, comment: 'برخورد خوب و تعمیر دقیق بود.' })
})

it('localizes a failed review submission without clearing the form', async () => {
  source.submitReview.mockRejectedValueOnce(Object.assign(new Error('English rate limit detail'), { code: 'RATE_LIMITED' }))
  const user = setupUser()
  renderAt('/shops/4')
  await screen.findByText('ساعت‌سازی نمونه')
  await user.type(screen.getByLabelText('نام شما'), 'سارا')
  await user.selectOptions(screen.getByLabelText('امتیاز'), '4')
  await user.type(screen.getByLabelText('نظر شما'), 'برخورد خوب و تعمیر دقیق بود.')
  await user.click(screen.getByRole('button', { name: 'ارسال نظر' }))
  expect(await screen.findByText('درخواست‌های زیادی ارسال شده است. کمی بعد دوباره تلاش کنید.')).toBeVisible()
  expect(screen.queryByText('English rate limit detail')).not.toBeInTheDocument()
  expect(screen.getByLabelText('نام شما')).toHaveValue('سارا')
})
