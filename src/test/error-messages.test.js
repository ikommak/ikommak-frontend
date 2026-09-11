import { expect, it } from 'vitest'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { persianErrorMessage, persianFieldErrors } from '../domain/errors.js'
import ErrorState from '../components/ErrorState.jsx'

it.each([
  ['NETWORK_ERROR', 'ارتباط با سرور برقرار نشد.'],
  ['TIMEOUT', 'زمان پاسخ‌گویی سرور تمام شد.'],
  ['SHOP_NOT_FOUND', 'این تعمیرگاه پیدا نشد.'],
  ['RATE_LIMITED', 'درخواست‌های زیادی ارسال شده است. کمی بعد دوباره تلاش کنید.'],
  ['AUTH_REQUIRED', 'نشست مدیریت پایان یافته است. دوباره وارد شوید.'],
])('maps %s to safe Persian copy', (code, expected) => {
  expect(persianErrorMessage({ code, message: 'English server text' }, 'خطا')).toBe(expected)
})

it('uses the caller fallback instead of exposing an unknown server message', () => {
  expect(persianErrorMessage({ code: 'INTERNAL_ERROR', message: 'SQL failed for private table' }, 'عملیات انجام نشد.')).toBe('عملیات انجام نشد.')
})

it('accepts validation fields only from a validation error', () => {
  expect(persianFieldErrors({ code: 'VALIDATION_ERROR', fields: { phone: 'شماره نامعتبر است' } })).toEqual({ phone: 'شماره نامعتبر است' })
  expect(persianFieldErrors({ code: 'INTERNAL_ERROR', fields: { phone: 'private detail' } })).toEqual({})
})

it('does not render an unknown server message in a public error state', () => {
  render(createElement(ErrorState, { error: { code: 'INTERNAL_ERROR', message: 'private SQL detail' } }))
  expect(screen.getByRole('alert')).toHaveTextContent('لطفاً دوباره تلاش کنید.')
  expect(screen.getByRole('alert')).not.toHaveTextContent('private SQL detail')
})
