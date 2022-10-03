import { FetchError } from '@utils/fetch'
import { useCallback, useState } from 'react'
import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query'

type UseQueryParams = Parameters<typeof useQuery>

export default function useLazyQuery<TData>(
  key: UseQueryParams[0],
  fetchFn: QueryFunction<TData, QueryKey>,
  options?: Omit<
    UseQueryOptions<TData, FetchError, TData, QueryKey>,
    'queryKey' | 'queryFn'
  >,
): [() => void, UseQueryResult<TData, FetchError>] {
  const [enabled, setEnabled] = useState(false)

  const query = useQuery<TData, FetchError, TData, QueryKey>(key, fetchFn, {
    ...(options || {}),
    enabled,
  })

  const trigger = useCallback(() => {
    if (!enabled) {
      setEnabled(true)
    }
  }, [fetchFn, enabled])

  return [trigger, query]
}
