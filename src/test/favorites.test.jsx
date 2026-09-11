import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import { FAVORITES_KEY, useFavorites } from '../hooks/useFavorites.js'

it('repairs corrupt favorite storage to unique positive string IDs', () => {
  localStorage.setItem(FAVORITES_KEY, '[1,"1",2,null,"0","bad"]')
  const { result } = renderHook(() => useFavorites())

  expect(result.current.ids).toEqual(['1', '2'])
  expect(JSON.parse(localStorage.getItem(FAVORITES_KEY))).toEqual(['1', '2'])

  act(() => result.current.toggle('3'))
  expect(result.current.has(3)).toBe(true)
  act(() => result.current.prune(['2', '3']))
  expect(result.current.ids).toEqual(['2', '3'])
})
