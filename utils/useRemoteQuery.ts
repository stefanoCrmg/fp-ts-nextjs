import * as RD from '@devexperts/remote-data-ts'
import * as O from '@effect/data/Option'
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
import { FrontendEnv, FrontendLive } from './frontendEnv'
import { flow, pipe, identity } from '@effect/data/Function'
import * as Ex from '@effect/io/Exit'
import * as Cause from '@effect/io/Cause'

const ExUnsafeGetOrThrow: <E, A>(self: Ex.Exit<E, A>) => A = Ex.match(
  (cause) => {
    throw Cause.squash(cause)
  },
  identity,
)

export type ErrorWithStaleData<E, A> = {
  readonly error: E
  readonly staleData: O.Option<A>
  readonly refetch: (options?: RefetchOptions & RefetchQueryFilters<A>) => void
}
export const useQueryRemoteData = <
  QueryFnData,
  E,
  A = QueryFnData,
  Key extends QueryKey = QueryKey,
>(
  queryKey: Key,
  queryFn: (
    context: QueryFunctionContext<Key>,
  ) => Z.Effect<FrontendEnv, E | FetchError, QueryFnData>,
  options?: UseQueryOptions<QueryFnData, E | FetchError, A, Key>,
): RD.RemoteData<ErrorWithStaleData<E | FetchError, A>, A> => {
  const _queryFn = flow(
    queryFn,
    Z.provideSomeLayer(FrontendLive),
    Z.runPromiseExit,
    (_) => _.then((exit) => pipe(exit, Ex.unannotate, ExUnsafeGetOrThrow)),
  )

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
  const _mutationFn = flow(
    mutationFn,
    Z.provideSomeLayer(FrontendLive),
    Z.runPromise,
  )
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
