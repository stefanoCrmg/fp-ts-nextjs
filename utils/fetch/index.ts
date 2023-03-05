/* eslint-disable no-console */
import { match } from 'ts-pattern'
import * as ContentTypeHelpers from 'content-type'
import * as E from '@effect/data/Either'
import * as S from '@effect/schema'
import { flow, pipe } from '@effect/data/Function'
import * as O from '@effect/data/Option'
import * as Z from '@effect/io/Effect'
import * as Data from '@effect/data/Data'
import type { Json } from '@effect/schema/data/Json'
import { ParseError } from '@effect/schema/ParseResult'
import type { NonEmptyReadonlyArray } from '@effect/data/ReadonlyArray'

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
): Z.Effect<never, GenericFetchError, Response> =>
  Z.tryCatchPromise(
    () => fetch(input, init),
    flow(
      (error) => (error instanceof Error ? error.message : 'Unknown error.'),
      (message) => GenericFetchError({ message }),
    ),
  )

const contentTypeIsJson = (headers: Headers): boolean =>
  pipe(
    headers.get(CONTENT_TYPE_RESPONSE_HEADER),
    O.fromNullable,
    O.map(flow(ContentTypeHelpers.parse, (result) => result.type)),
    O.exists((type) => type === CONTENT_TYPE_JSON),
  )
const statusCodeIs40x = (status: number): boolean =>
  status >= 400 && status <= 451
const statusCodeIs50x = (status: number): boolean =>
  status >= 500 && status <= 511

export const matchResponse = (
  response: Response,
): Z.Effect<
  never,
  HttpClientError | HttpServerError | JsonParseError | NotJson,
  Json
> => {
  return match(response)
    .when(
      (response) => statusCodeIs40x(response.status),
      (r) =>
        Z.fail(HttpClientError({ statusCode: r.status, originalResponse: r })),
    )
    .when(
      (response) => statusCodeIs50x(response.status),
      (r) => Z.fail(HttpServerError({ statusCode: r.status })),
    )
    .when(
      (response) => contentTypeIsJson(response.headers),
      (r) =>
        Z.tryCatchPromise(
          () => r.json() as Promise<Json>,
          (error) =>
            JsonParseError({
              message:
                error instanceof Error ? error.message : 'Unknown error.',
            }),
        ),
    )
    .otherwise(() => Z.fail(NotJson()))
}

export const getJsonAndValidate =
  <A>(schema: S.Schema<A>) =>
  (response: Response): Z.Effect<never, FetchError, A> =>
    pipe(
      matchResponse(response),
      Z.tapErrorCause(Z.logErrorCause),
      Z.flatMap((json) =>
        pipe(
          S.decode(schema)(json, { isUnexpectedAllowed: true }),
          E.mapLeft((errors) => DecodingFailure({ errors })),
          Z.fromEither,
        ),
      ),
    )

export const fetchAndValidate = <A>(
  schema: S.Schema<A>,
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): Z.Effect<never, FetchError, A> =>
  pipe(fromFetch(input, init), Z.flatMap(getJsonAndValidate(schema)))
