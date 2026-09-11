import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createRoutes } from '../app/router.jsx'

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function textResponse(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } })
}

export function apiError(code, message, fields = undefined) {
  return { error: { code, message, ...(fields ? { fields } : {}) } }
}

export function renderAt(path = '/') {
  const router = createMemoryRouter(createRoutes(), { initialEntries: [path] })
  return { ...render(<RouterProvider router={router} />), router }
}

export const setupUser = () => userEvent.setup()
