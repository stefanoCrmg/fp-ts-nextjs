import * as RD from '@devexperts/remote-data-ts'
import * as O from 'effect/Option'
import * as Data from 'effect/data'
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
import * as Effect from 'effect/Effect'
import { FrontendEnv, FrontendLive } from './frontendEnv'
import { identity, pipe } from 'effect/Function'
import * as Ex from 'effect/Exit'
import * as Cause from 'effect/Cause'
import * as Context from 'effect/Context'

export type QueryExecutionContext = QueryFunctionContext<QueryKey>
export const QueryExecutionContext = Context.Tag<QueryExecutionContext>()

const ExUnsafeGetOrThrow = <E, A>(self: Ex.Exit<E, A>): A =>
  self.pipe(
    Ex.unannotate,
    Ex.match({
      onFailure: (cause) => {
        throw cause
      },
      onSuccess: identity,
    }),
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
  queryFn: Effect.Effect<
    FrontendEnv | QueryExecutionContext,
    E | FetchError,
    QueryFnData
  >,
  options?: UseQueryOptions<QueryFnData, Cause.Cause<E | FetchError>, A, Key>,
): RD.RemoteData<ErrorWithStaleData<Cause.Cause<E | FetchError>, A>, A> => {
  const _queryFn = (tanstackQueryContext: QueryFunctionContext<Key>) =>
    pipe(
      queryFn,
      Effect.provideSomeLayer(FrontendLive),
      Effect.provideContext(
        QueryExecutionContext.context(tanstackQueryContext),
      ),
      Effect.runPromiseExit,
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
  ) => Effect.Effect<FrontendEnv, E | FetchError, A>,
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
  const _mutationFn = (_: MutationVariables) =>
    pipe(
      mutationFn(_),
      Effect.provideSomeLayer(FrontendLive),
      Effect.runPromise,
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
