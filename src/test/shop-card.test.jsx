import { screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderAt } from './helpers.jsx'

it('renders the directory heading for a direct shop-list route', async () => {
  renderAt('/shops')
  expect(await screen.findByRole('heading', { name: 'تعمیرکار موردنیازتان را پیدا کنید' })).toBeInTheDocument()
})
