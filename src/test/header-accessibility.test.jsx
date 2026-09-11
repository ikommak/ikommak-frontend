import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it } from 'vitest'
import Header from '../components/Header.jsx'
import { setupUser } from './helpers.jsx'

it('closes the mobile menu with Escape and restores focus to its trigger', async () => {
  const user = setupUser()
  render(<MemoryRouter initialEntries={['/shops']}><Header /></MemoryRouter>)
  const trigger = screen.getByRole('button', { name: 'باز کردن منو' })
  await user.click(trigger)
  expect(screen.getByRole('button', { name: 'بستن منو' })).toHaveAttribute('aria-expanded', 'true')
  await user.keyboard('{Escape}')
  expect(screen.getByRole('button', { name: 'باز کردن منو' })).toHaveFocus()
})

it('uses route-safe home anchors and real destinations for header actions', () => {
  render(<MemoryRouter initialEntries={['/shops']}><Header /></MemoryRouter>)
  expect(screen.getByRole('link', { name: 'خدمات' })).toHaveAttribute('href', '/#services')
  expect(screen.getAllByRole('link', { name: 'ورود مدیریت' })[0]).toHaveAttribute('href', '/admin/login')
  expect(screen.getAllByRole('link', { name: 'ثبت تعمیرگاه' })[0]).toHaveAttribute('href', '/#shops')
})
