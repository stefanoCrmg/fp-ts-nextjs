/* eslint-disable no-console */
import { match } from 'ts-pattern'
import * as ContentTypeHelpers from 'content-type'
import * as S from '@effect/schema/Schema'
import { compose, pipe } from 'effect/Function'
import * as O from 'effect/Option'
import * as Effect from 'effect/Effect'
import * as Data from 'effect/Data'
import { ParseError } from '@effect/schema/ParseResult'
import type { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'

const CONTENT_TYPE_RESPONSE_HEADER = 'content-type'
const CONTENT_TYPE_JSON = 'application/json'

export interface DecodingFailure extends Data.Case {
  readonly _tag: 'DecodingFailure'
  readonly errors: NonEmptyReadonlyArray<ParseError>
}
export const DecodingFailure = Data.tagged<DecodingFailure>('DecodingFailure')

export interface EncodingFailure extends Data.Case {
  readonly _tag: 'EncodingFailure'
  readonly errors: NonEmptyReadonlyArray<ParseError>
}
export const EncodingFailure = Data.tagged<EncodingFailure>('EncodingFailure')

export interface GenericFetchError extends Data.Case {
  readonly _tag: 'GenericFetchError'
  readonly message: string
}
export const GenericFetchError =
  Data.tagged<GenericFetchError>('GenericFetchError')

export interface HttpClientError extends Data.Case {
  readonly _tag: 'HttpClientError'
  readonly statusCode: number
  readonly originalResponse: Response
}
export const HttpClientError = Data.tagged<HttpClientError>('HttpClientError')

export interface HttpServerError extends Data.Case {
  readonly _tag: 'HttpServerError'
  readonly statusCode: number
}
export const HttpServerError = Data.tagged<HttpServerError>('HttpServerError')

export interface NotJson extends Data.Case {
  readonly _tag: 'NotJson'
}
export const NotJson = Data.tagged<NotJson>('NotJson')

export interface JsonParseError extends Data.Case {
  readonly _tag: 'JsonParseError'
  readonly message: string
}
export const JsonParseError = Data.tagged<JsonParseError>('JsonParseError')

export type FetchError =
  | GenericFetchError
  | DecodingFailure
  | EncodingFailure
  | HttpClientError
  | HttpServerError
  | NotJson
  | JsonParseError

export const fromFetch = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Effect.Effect<never, GenericFetchError, Response> =>
  Effect.gen(function* ($) {
    /**
     * The fetch is actually going to be canceled by the abortSignal present in the `init` parameter of `fromFetch`
     * `init.signal` is passed down to the fetch operation by tanstack query, the following event should cleanup (and interrupt) an Effect's fiber
     * but it doesn't really work as expected: tanstack query seems to rollback a query to its previous state, ignoring the possible
     * execution outcome of the fetch operation.
     *
     * What this means is that, even if interrupted correctly, the fiber error never "reaches" tanstack-query's error channel.
     *
     * TODO:
     * 1. Instead of a GenericFetchError, return a Fiber Interrupt?
     * 2. Drop using tanstack-query's abortSignal in favour of Effect's and return the instance of Effect.interrupt somehow to the hook caller?
     */
    const eff = Effect.tryPromiseInterrupt({
      try: () => fetch(input, init),
      catch: compose(
        (error) => (error instanceof Error ? error.message : 'Unknown error.'),
        (message) => GenericFetchError({ message }),
      ),
    })

    return yield* $(eff)
  })

const contentTypeIsJson = (headers: Headers): boolean =>
  pipe(
    headers.get(CONTENT_TYPE_RESPONSE_HEADER),
    O.fromNullable,
    O.map(compose(ContentTypeHelpers.parse, (result) => result.type)),
    O.exists((type) => type === CONTENT_TYPE_JSON),
  )
const statusCodeIs40x = (status: number): boolean =>
  status >= 400 && status <= 451
const statusCodeIs50x = (status: number): boolean =>
  status >= 500 && status <= 511

export const matchResponse = (
  response: Response,
): Effect.Effect<
  never,
  HttpClientError | HttpServerError | JsonParseError | NotJson,
  JSON
> => {
  return match(response)
    .when(
      (response) => statusCodeIs40x(response.status),
      (r) => {
        return Effect.fail(
          HttpClientError({ statusCode: r.status, originalResponse: r }),
        )
      },
    )
    .when(
      (response) => statusCodeIs50x(response.status),
      (r) => Effect.fail(HttpServerError({ statusCode: r.status })),
    )
    .when(
      (response) => contentTypeIsJson(response.headers),
      (r) =>
        Effect.tryPromise({
          try: () => r.json() as Promise<JSON>,
          catch: (error) =>
            JsonParseError({
              message:
                error instanceof Error ? error.message : 'Unknown error.',
            }),
        }),
    )
    .otherwise(() => Effect.fail(NotJson()))
}

export const getJsonAndValidate =
  <I, A>(schema: S.Schema<I, A>) =>
  (response: Response): Effect.Effect<never, FetchError, A> =>
    pipe(
      matchResponse(response),
      Effect.tapErrorCause(Effect.logError),
      Effect.flatMap((json) =>
        pipe(
          S.parse(schema)(json, { onExcessProperty: 'ignore' }),
          Effect.mapError((errors) => DecodingFailure({ errors: [errors] })),
        ),
      ),
    )

export const fetchAndValidate = <I, A>(
  schema: S.Schema<I, A>,
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Effect.Effect<never, FetchError, A> =>
  pipe(fromFetch(input, init), Effect.flatMap(getJsonAndValidate(schema)))
