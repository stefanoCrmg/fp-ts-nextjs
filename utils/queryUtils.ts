import {
  QueryObserverLoadingErrorResult,
  QueryObserverLoadingResult,
  QueryObserverRefetchErrorResult,
  QueryObserverSuccessResult,
  UseQueryResult,
} from '@tanstack/react-query'
import { match } from 'ts-pattern'

type ErrorFunction<E, A, O> = (
  params:
    | QueryObserverRefetchErrorResult<A, E>
    | QueryObserverLoadingErrorResult<A, E>,
) => O
type LoadingFunction<E, A, O> = (params: QueryObserverLoadingResult<A, E>) => O
type SuccessFunction<E, A, O> = (params: QueryObserverSuccessResult<A, E>) => O

export const fold3 =
  <E, A, O>(
    onLoading: LoadingFunction<E, A, O>,
    onError: ErrorFunction<E, A, O>,
    onSuccess: SuccessFunction<E, A, O>,
  ) =>
  (qr: UseQueryResult<A, E>) =>
    match(qr)
      .with({ status: 'loading' }, onLoading)
      .with({ status: 'error' }, onError)
      .with({ status: 'success' }, onSuccess)
      .exhaustive()
