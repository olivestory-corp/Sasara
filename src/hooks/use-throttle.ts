import * as React from 'react'
import useLatest from '@react-hook/latest'

const perf = typeof performance !== 'undefined' ? performance : Date
const now = () => perf.now()

export function useThrottleCallback<CallbackArguments extends unknown[]>(
  callback: (...args: CallbackArguments) => void,
  fps = 30,
  leading = false,
): (...args: CallbackArguments) => void {
  const storedCallback = useLatest(callback)
  const ms = 1000 / fps
  const prev = React.useRef(0)
  const trailingTimeout = React.useRef<ReturnType<typeof setTimeout>>()
  const clearTrailing = () => trailingTimeout.current && clearTimeout(trailingTimeout.current)
  const deps = [fps, leading, storedCallback]

  // Reset any time the deps change
  // React.useEffect(
  //   () => () => {
  //     prev.current = 0
  //     clearTrailing()
  //   },
  //   deps,
  // )

  return React.useCallback(function (...args: CallbackArguments) {
    // eslint-disable-next-line prefer-rest-params
    // const args = arguments
    const rightNow = now()
    const call = () => {
      prev.current = rightNow
      clearTrailing()
      storedCallback.current.apply(null, args)
    }
    const current = prev.current
    // leading
    if (leading && current === 0) return call()
    // body
    if (rightNow - current > ms) {
      if (current > 0) return call()
      prev.current = rightNow
    }
    // trailing
    clearTrailing()
    trailingTimeout.current = setTimeout(() => {
      call()
      prev.current = 0
    }, ms)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useThrottle<State>(
  initialState: State | (() => State),
  fps?: number,
  leading?: boolean,
): [State, React.Dispatch<React.SetStateAction<State>>] {
  const state = React.useState<State>(initialState)
  return [state[0], useThrottleCallback(state[1], fps, leading)]
}
