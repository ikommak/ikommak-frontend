import { renderHook, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useApiResource } from '../hooks/useApiResource.js'

it('shows a retryable error and recovers with retry', async () => {
  const load = vi.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ id: '4' })
  const { result } = renderHook(() => useApiResource(load, []))

  await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
  expect(result.current.loading).toBe(false)
  result.current.retry()
  await waitFor(() => expect(result.current.data).toEqual({ id: '4' }))
  expect(result.current.error).toBeNull()
})
