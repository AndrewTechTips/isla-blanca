import { useEffect, useState } from 'react'

type State<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: Error }

/**
 * Loads data once per change of `key`, cancelling the request if the component unmounts.
 * Phase 5 replaces this with TanStack Query (caching, retries, mutations).
 */
export function useApi<T>(key: string, load: (signal: AbortSignal) => Promise<T>): State<T> {
  const [state, setState] = useState<State<T>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  })

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading', data: undefined, error: undefined })
    load(controller.signal)
      .then((data) => setState({ status: 'success', data, error: undefined }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          data: undefined,
          error: error instanceof Error ? error : new Error(String(error)),
        })
      })
    return () => controller.abort()
    // `load` is recreated on every render; `key` identifies what is being loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return state
}
