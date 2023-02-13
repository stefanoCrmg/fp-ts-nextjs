import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/Option'
import { match } from 'ts-pattern'
import {
  MutationKey,
  QueryFunctionContext,
  QueryKey,
  RefetchOptions,
  RefetchQueryFilters,
  UseMutateFunction,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import { FetchError } from '@utils/fetch'
import * as Z from '@effect/io/Effect'
import { FrontendEnv, FrontendService } from './frontendEnv'
import { pipe } from 'fp-ts/function'

export type ErrorWithStaleData<E, A> = {
  readonly error: E
  readonly staleData: O.Option<A>
  readonly refetch: (options?: RefetchOptions & RefetchQueryFilters<A>) => void
}

const unwrapQueryFn =
  <T, E, Key extends QueryKey = QueryKey>(
    service: FrontendEnv,
    queryFn: (
      context: QueryFunctionContext<Key>,
    ) => Z.Effect<FrontendEnv, E, T>,
  ) =>
  (context: QueryFunctionContext<Key>): Promise<T> =>
    pipe(queryFn(context), Z.provideService(FrontendEnv, service), Z.runPromise)

const unwrapMutationFn =
  <A, E, MutationVariables = void>(
    service: FrontendEnv,
    mutationFn: (mv: MutationVariables) => Z.Effect<FrontendEnv, E, A>,
  ) =>
  (mv: MutationVariables): Promise<A> =>
    pipe(mutationFn(mv), Z.provideService(FrontendEnv, service), Z.runPromise)

export const useQueryRemoteData = <
  QueryFnData,
  E,
  A = QueryFnData,
  Key extends QueryKey = QueryKey,
>(
  queryKey: Key,
  queryFn: (
    context: QueryFunctionContext<Key>,
  ) => Z.Effect<FrontendEnv, E, QueryFnData>,
  options?: UseQueryOptions<QueryFnData, E, A, Key>,
): RD.RemoteData<ErrorWithStaleData<E, A>, A> => {
  const _queryFn = unwrapQueryFn(FrontendService, queryFn)
  const query = useQuery(queryKey, _queryFn, options)

  return match(query)
    .with({ status: 'success' }, ({ data }) => RD.success(data))
    .with({ status: 'error' }, ({ error, data, refetch }) =>
      RD.failure({ error, refetch, staleData: O.fromNullable(data) }),
    )
    .with({ status: 'loading' }, () => RD.pending)
    .exhaustive()
}

type UseMutationRemoteDataResult<TData, TError, TVariables, TContext> = {
  mutate: UseMutateFunction<TData, TError, TVariables, TContext>
  lifeCycle: RD.RemoteData<TError, TData>
}

export const useMutationRemoteData = <
  A,
  MutationVariables = void,
  TContext = unknown,
>(
  mutationKey: MutationKey,
  mutationFn: (
    variables: MutationVariables,
  ) => Z.Effect<FrontendEnv, FetchError, A>,
  mutationOptions?: UseMutationOptions<
    A,
    FetchError,
    MutationVariables,
    TContext
  >,
): UseMutationRemoteDataResult<A, FetchError, MutationVariables, TContext> => {
  const _mutationFn = unwrapMutationFn(FrontendService, mutationFn)
  const mutation = useMutation(mutationKey, _mutationFn, mutationOptions)

  const lifeCycle: RD.RemoteData<FetchError, A> = match(mutation)
    .with({ status: 'success' }, ({ data }) => RD.success(data))
    .with({ status: 'error' }, ({ error }) => RD.failure(error))
    .with({ status: 'idle' }, () => RD.initial)
    .with({ status: 'loading' }, () => RD.pending)
    .exhaustive()

  return {
    mutate: mutation.mutate,
    lifeCycle,
  }
}
