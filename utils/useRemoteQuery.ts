/* adapted from https://tanstack.com/ in order to use remote-data-ts */
import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/Option'
import { match } from 'ts-pattern'

import { QueryFunction, QueryKey } from '@tanstack/query-core'
import {
  MutationFunction,
  MutationKey,
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import { FetchError } from '@utils/fetch'

type ErrorWithStaleData<E, StaleData> = {
  readonly error: E
  readonly staleData: O.Option<StaleData>
}

export const useQueryRemoteData = <
  TQueryFnData,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: UseQueryOptions<TQueryFnData, FetchError, TData, TQueryKey>,
): RD.RemoteData<ErrorWithStaleData<FetchError, TData>, TData> => {
  const query = useQuery(queryKey, queryFn, options)
  return match(query)
    .with({ status: 'success' }, ({ data }) => RD.success(data))
    .with({ status: 'error' }, ({ error, data }) =>
      RD.failure({ error, staleData: O.fromNullable(data) }),
    )
    .with({ status: 'loading' }, () => RD.pending)
    .exhaustive()
}

type UseMutationRemoteDataResult<TData, TError, TVariables, TContext> = {
  mutate: UseMutateFunction<TData, TError, TVariables, TContext>
  mutateAsync: UseMutateAsyncFunction<TData, TError, TVariables, TContext>
  lifeCycle: RD.RemoteData<TError, TData>
}

export const useMutationRemoteData = <
  TData,
  TVariables = void,
  TContext = unknown,
>(
  mutationKey: MutationKey,
  mutationFn: MutationFunction<TData, TVariables>,
  mutationOptions?: UseMutationOptions<TData, FetchError, TVariables, TContext>,
): UseMutationRemoteDataResult<TData, FetchError, TVariables, TContext> => {
  const mutation = useMutation(mutationKey, mutationFn, mutationOptions)

  const lifeCycle = match(mutation)
    .with({ status: 'success' }, ({ data }) => RD.success(data))
    .with({ status: 'error' }, ({ error }) => RD.failure(error))
    .with({ status: 'idle' }, () => RD.initial)
    .with({ status: 'loading' }, () => RD.pending)
    .exhaustive()

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    lifeCycle,
  }
}
