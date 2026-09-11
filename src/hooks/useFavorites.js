import { useCallback, useEffect, useState } from 'react'

export const FAVORITES_KEY = 'ikommak.favoriteShopIds'

function normalizeIds(value) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.map(value => String(value)).filter(value => /^[1-9]\d*$/u.test(value)))].slice(0, 50)
}

function readIds() {
  try { return normalizeIds(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')) } catch { return [] }
}

function writeIds(ids) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)) } catch { /* Private browsing storage can be unavailable. */ }
}

export function useFavorites() {
  const [ids, setIds] = useState(() => {
    const next = readIds()
    writeIds(next)
    return next
  })
  const setAndStore = useCallback(updater => setIds(previous => {
    const next = normalizeIds(typeof updater === 'function' ? updater(previous) : updater)
    writeIds(next)
    return next
  }), [])

  useEffect(() => {
    const onStorage = event => { if (event.key === FAVORITES_KEY) setIds(readIds()) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const has = useCallback(id => ids.includes(String(id)), [ids])
  const toggle = useCallback(id => {
    const value = String(id)
    if (!/^[1-9]\d*$/u.test(value)) return
    setAndStore(previous => previous.includes(value) ? previous.filter(item => item !== value) : [...previous, value])
  }, [setAndStore])
  const prune = useCallback(validIds => {
    const allowed = new Set(normalizeIds(validIds))
    setAndStore(previous => previous.filter(id => allowed.has(id)))
  }, [setAndStore])

  return { ids, has, toggle, prune }
}
