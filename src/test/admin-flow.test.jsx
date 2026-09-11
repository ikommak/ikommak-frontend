import { screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { renderAt, setupUser } from './helpers.jsx'

const source = {
  getAdminSession: vi.fn(), loginAdmin: vi.fn(), logoutAdmin: vi.fn(),
  listAdminReviews: vi.fn(), moderateReview: vi.fn(),
  listAdminReservations: vi.fn(), updateReservation: vi.fn(),
}
vi.mock('../data/mockApi.js', () => ({ dataSource: () => source }))

const page = data => ({ data, pagination: { page: 1, limit: 20, total: data.length, totalPages: data.length ? 1 : 0 } })
const pendingReview = {
  id: '31', source: 'user', authorName: 'مینا', rating: 4, comment: 'تعمیر با دقت انجام شد.',
  originalDate: null, relativeTime: null, reviewedAt: '2026-09-09T08:00:00.000Z', createdAt: '2026-09-09T08:00:00.000Z',
  status: 'pending', adminNote: null, moderatedAt: null, updatedAt: null,
  shop: { id: '7', name: 'کفاشی نمونه' },
}
const pendingReservation = {
  id: '51', reference: 'IK-ABC123DEF456', status: 'pending', preferredAt: '2099-09-10T06:30:00.000Z',
  problemDescription: 'کفش من نیاز به تعمیر کامل دارد.', adminNote: null,
  createdAt: '2026-09-09T08:00:00.000Z', updatedAt: null,
  customer: { name: 'سارا احمدی', phone: '09121234567', phoneDisplay: '09121234567' },
  shop: { id: '7', name: 'کفاشی نمونه', phone: '02122334455', address: 'تهران، منطقه ۲' },
  category: null, service: null,
}

beforeEach(() => {
  source.getAdminSession.mockReset().mockResolvedValue({ authenticated: true, username: 'admin' })
  source.loginAdmin.mockReset().mockResolvedValue({ authenticated: true, username: 'admin' })
  source.logoutAdmin.mockReset().mockResolvedValue({ authenticated: false, username: null })
  source.listAdminReviews.mockReset().mockResolvedValue(page([pendingReview]))
  source.listAdminReservations.mockReset().mockResolvedValue(page([pendingReservation]))
  source.moderateReview.mockReset().mockResolvedValue({ ...pendingReview, status: 'approved' })
  source.updateReservation.mockReset().mockResolvedValue({ ...pendingReservation, status: 'contacted' })
})

it('redirects an unauthenticated administrator to login', async () => {
  source.getAdminSession.mockRejectedValueOnce(Object.assign(new Error('Authentication required'), { status: 401, code: 'AUTH_REQUIRED' }))
  renderAt('/admin')
  expect(await screen.findByRole('heading', { name: 'ورود مدیریت' })).toBeVisible()
})

it('provides a keyboard skip link on authenticated admin pages', async () => {
  renderAt('/admin')
  expect(await screen.findByRole('link', { name: 'رفتن به محتوای مدیریت' })).toHaveAttribute('href', '#admin-content')
  expect(document.getElementById('admin-content')).toHaveAttribute('tabindex', '-1')
})

it('removes a pending review only after approval succeeds', async () => {
  let resolveApproval
  source.moderateReview.mockImplementationOnce(() => new Promise(resolve => { resolveApproval = resolve }))
  const user = setupUser()
  renderAt('/admin')
  expect(await screen.findByText('تعمیر با دقت انجام شد.')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'تأیید نظر' }))
  expect(screen.getByText('تعمیر با دقت انجام شد.')).toBeVisible()
  resolveApproval({ ...pendingReview, status: 'approved' })
  await waitFor(() => expect(screen.queryByText('تعمیر با دقت انجام شد.')).not.toBeInTheDocument())
})

it('moves a pending reservation forward after server confirmation', async () => {
  const user = setupUser()
  renderAt('/admin')
  expect(await screen.findByText('IK-ABC123DEF456')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'تماس انجام شد' }))
  await waitFor(() => expect(screen.queryByText('IK-ABC123DEF456')).not.toBeInTheDocument())
})

it('keeps an admin row and localizes a failed moderation request', async () => {
  source.moderateReview.mockRejectedValueOnce(Object.assign(new Error('private server detail'), { code: 'REVIEW_STATUS_CONFLICT' }))
  const user = setupUser()
  renderAt('/admin')
  expect(await screen.findByText('تعمیر با دقت انجام شد.')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'تأیید نظر' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('وضعیت این نظر قبلاً تغییر کرده است. اطلاعات را دوباره دریافت کنید.')
  expect(screen.getByText('تعمیر با دقت انجام شد.')).toBeVisible()
  expect(screen.queryByText('private server detail')).not.toBeInTheDocument()
})

it('keeps a reservation row and localizes a failed transition', async () => {
  source.updateReservation.mockRejectedValueOnce(Object.assign(new Error('private transition detail'), { code: 'INVALID_STATUS_TRANSITION' }))
  const user = setupUser()
  renderAt('/admin')
  expect(await screen.findByText('IK-ABC123DEF456')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'تماس انجام شد' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('این تغییر وضعیت مجاز نیست. اطلاعات را دوباره دریافت کنید.')
  expect(screen.getByText('IK-ABC123DEF456')).toBeVisible()
  expect(screen.queryByText('private transition detail')).not.toBeInTheDocument()
})
