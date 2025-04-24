import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query'
import { throttle } from 'lodash'
import { useCallback, useRef } from 'react'

function useThrottledMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
  throttleMs = 1000,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const throttledFn = useRef(throttle((variables: TVariables) => mutationFn(variables), throttleMs)).current

  const wrappedMutationFn = useCallback(
    (variables: TVariables) => {
      return new Promise<TData>((resolve, reject) => {
        throttledFn(variables)
          .then((data: TData) => resolve(data))
          .catch((error: TError) => reject(error))
      })
    },
    [throttledFn],
  )

  // @ts-ignore
  return useMutation<TData, TError, TVariables, TContext>(wrappedMutationFn, options)
}

export default useThrottledMutation
