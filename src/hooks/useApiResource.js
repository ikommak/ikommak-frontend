import { useCallback, useEffect, useRef, useState } from 'react'

export function useApiResource(load, dependencies = []) {
  const [state, setState] = useState({ data: null, loading: true, refreshing: false, error: null })
  const retryRef = useRef(0)
  const [retryVersion, setRetryVersion] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    setState(previous => ({ ...previous, loading: previous.data === null, refreshing: previous.data !== null, error: null }))
    Promise.resolve(load(controller.signal)).then(
      data => { if (current) setState({ data, loading: false, refreshing: false, error: null }) },
      error => {
        if (current && error?.name !== 'AbortError') setState(previous => ({ ...previous, loading: false, refreshing: false, error }))
      },
    )
    return () => { current = false; controller.abort() }
  // The caller controls resource identity through dependencies.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, retryVersion])

  const retry = useCallback(() => {
    retryRef.current += 1
    setRetryVersion(retryRef.current)
  }, [])

  return { ...state, retry }
}
