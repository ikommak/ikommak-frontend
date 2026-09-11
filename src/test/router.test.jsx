import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from './helpers.jsx'

describe('application routes', () => {
  it.each([
    ['/', /تعمیرکار مطمئن/], ['/shops', 'تعمیرکار موردنیازتان را پیدا کنید'], ['/shops/42', 'جزئیات تعمیرکار'],
    ['/shops/42/reserve', 'درخواست رزرو'], ['/reservations/IK-ABC/success', 'ثبت درخواست'],
    ['/admin/login', 'ورود مدیریت'],
  ])('renders %s directly with its Persian heading', async (path, heading) => {
    renderAt(path)
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('renders a branded not-found page for unmatched deep routes', async () => {
    renderAt('/missing/deep-link')
    expect(await screen.findByRole('heading', { name: 'صفحه پیدا نشد' })).toBeInTheDocument()
  })

  it('provides a keyboard skip link to the public page content', async () => {
    renderAt('/missing/deep-link')
    expect(await screen.findByRole('link', { name: 'رفتن به محتوای اصلی' })).toHaveAttribute('href', '#main-content')
    expect(document.getElementById('main-content')).toHaveAttribute('tabindex', '-1')
  })
})
