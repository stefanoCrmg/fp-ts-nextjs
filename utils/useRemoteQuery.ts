import * as RD from '@devexperts/remote-data-ts'
import * as O from '@effect/data/Option'
import * as Data from '@effect/data/Data'
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
import { flow, identity } from '@effect/data/Function'
import * as Ex from '@effect/io/Exit'
import * as Cause from '@effect/io/Cause'

const ExUnsafeGetOrThrow: <E, A>(self: Ex.Exit<E, A>) => A = flow(
  Ex.unannotate,
  Ex.match((cause) => {
    throw cause
  }, identity),
)

export type ErrorWithStaleData<E, A> = {
  readonly error: E
  readonly staleData: O.Option<A>
  readonly refetch: (options?: RefetchOptions & RefetchQueryFilters<A>) => void
}
export const useQueryRemoteData = <
  QueryFnData,
  E extends Data.Case,
  A = QueryFnData,
  Key extends QueryKey = QueryKey,
>(
  queryKey: Key,
  queryFn: (
    context: QueryFunctionContext<Key>,
  ) => Z.Effect<FrontendEnv, E | FetchError, QueryFnData>,
  options?: UseQueryOptions<QueryFnData, Cause.Cause<E | FetchError>, A, Key>,
): RD.RemoteData<ErrorWithStaleData<Cause.Cause<E | FetchError>, A>, A> => {
  const _queryFn = flow(
    queryFn,
    Z.provideSomeLayer(FrontendLive),
    Z.runPromiseExit,
    (_) => _.then(ExUnsafeGetOrThrow),
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
  E extends Data.Case,
  MutationVariables = void,
  TContext = unknown,
>(
  mutationKey: MutationKey,
  mutationFn: (
    variables: MutationVariables,
  ) => Z.Effect<FrontendEnv, E | FetchError, A>,
  mutationOptions?: UseMutationOptions<
    A,
    FetchError,
    MutationVariables,
    TContext
  >,
): UseMutationRemoteDataResult<
  A,
  E | FetchError,
  MutationVariables,
  TContext
> => {
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
