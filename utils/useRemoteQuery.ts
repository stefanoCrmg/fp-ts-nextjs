/* adapted from https://tanstack.com/ in order to use remote-data-ts */
import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/Option'
import { match } from 'ts-pattern'

import { parseQueryArgs, QueryFunction, QueryKey } from '@tanstack/query-core'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { FetchError } from '@utils/fetch'

type ErrorWithStaleData<E, StaleData> = {
  readonly error: E
  readonly staleData: O.Option<StaleData>
}

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'initialData'
  > & { initialData?: () => undefined },
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'initialData'
  > & { initialData: TQueryFnData | (() => TQueryFnData) },
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'initialData'
  > & { initialData?: () => undefined },
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'initialData'
  > & { initialData: TQueryFnData | (() => TQueryFnData) },
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey'
  >,
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn' | 'initialData'
  > & { initialData?: () => undefined },
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn' | 'initialData'
  > & { initialData: TQueryFnData | (() => TQueryFnData) },
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData = unknown,
  TError = FetchError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn'
  >,
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData>

export function useQueryRemoteData<
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  arg1: TQueryKey | UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  arg2?:
    | QueryFunction<TQueryFnData, TQueryKey>
    | UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  arg3?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): RD.RemoteData<ErrorWithStaleData<TError, TData>, TData> {
  const parsedOptions = parseQueryArgs(arg1, arg2, arg3)
  const query = useQuery(parsedOptions)
  return match(query)
    .with({ status: 'success' }, ({ data }) => RD.success(data))
    .with({ status: 'error' }, ({ error, data }) =>
      RD.failure({ error, staleData: O.fromNullable(data) }),
    )
    .with({ status: 'loading' }, () => RD.pending)
    .exhaustive()
}
