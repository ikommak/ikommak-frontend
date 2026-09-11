import { screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderAt, setupUser } from './helpers.jsx'

const source = { isDemo: false, getShop: vi.fn(), submitReservation: vi.fn() }
vi.mock('../data/mockApi.js', () => ({ dataSource: () => source }))

const shop = {
  id: '7', name: 'کفاشی نمونه', initials: 'کن', managerName: null,
  phone: '02122334455', address: 'تهران، منطقه ۲',
  district: { id: '2', name: 'منطقه ۲ تهران' }, categories: [], services: [],
  location: { latitude: null, longitude: null, googleMapsUrl: null },
  googleRating: null, googleReviewCount: null,
  googleReviewsSummary: { rating: null, reviewCount: null },
  userReviewsSummary: { rating: null, reviewCount: 0 },
  reservationEnabled: true, createdAt: null,
}

beforeEach(() => {
  sessionStorage.clear()
  source.getShop.mockReset().mockResolvedValue(shop)
  source.submitReservation.mockReset().mockResolvedValue({
    reference: 'IK-4A7D8K2M9Q1Z', status: 'pending', preferredAt: '2099-09-10T06:30:00.000Z',
    createdAt: '2026-09-09T10:00:00.000Z',
    shop: { id: '7', name: 'کفاشی نمونه', phone: '02122334455', address: 'تهران، منطقه ۲' },
  })
})

it('submits a reservation request and shows a non-payment tracking receipt', async () => {
  const user = setupUser()
  renderAt('/shops/7/reserve')
  await screen.findByText('کفاشی نمونه')
  await user.type(screen.getByLabelText('نام و نام خانوادگی'), 'سارا احمدی')
  await user.type(screen.getByLabelText('شماره تماس'), '09121234567')
  await user.type(screen.getByLabelText('تاریخ و ساعت پیشنهادی'), '2099-09-10T10:00')
  await user.type(screen.getByLabelText('شرح مشکل'), 'کفش من نیاز به تعمیر کامل دارد.')
  await user.click(screen.getByRole('button', { name: 'ثبت درخواست رزرو' }))

  expect(await screen.findByText('IK-4A7D8K2M9Q1Z')).toBeVisible()
  expect(screen.getByText(/رزرو هنوز قطعی نیست/)).toBeVisible()
  expect(screen.queryByText(/پرداخت/)).not.toBeInTheDocument()
})

it('keeps entered values and localizes a recoverable submission failure', async () => {
  source.submitReservation.mockRejectedValueOnce(Object.assign(new Error('English network detail'), { code: 'NETWORK_ERROR' }))
  const user = setupUser()
  renderAt('/shops/7/reserve')
  await screen.findByText('کفاشی نمونه')
  await user.type(screen.getByLabelText('نام و نام خانوادگی'), 'سارا احمدی')
  await user.type(screen.getByLabelText('شماره تماس'), '09121234567')
  await user.type(screen.getByLabelText('تاریخ و ساعت پیشنهادی'), '2099-09-10T10:00')
  await user.type(screen.getByLabelText('شرح مشکل'), 'کفش من نیاز به تعمیر کامل دارد.')
  await user.click(screen.getByRole('button', { name: 'ثبت درخواست رزرو' }))

  expect(await screen.findByRole('alert')).toHaveTextContent('ارتباط با سرور برقرار نشد.')
  expect(screen.getByRole('alert')).not.toHaveTextContent('English network detail')
  expect(screen.getByLabelText('نام و نام خانوادگی')).toHaveValue('سارا احمدی')
  expect(screen.getByLabelText('شرح مشکل')).toHaveValue('کفش من نیاز به تعمیر کامل دارد.')
})
