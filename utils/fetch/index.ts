import * as Match from '@effect/match'
import * as ContentTypeHelpers from 'content-type'
import * as E from '@fp-ts/core/Either'
import * as S from '@fp-ts/schema'
import { flow, pipe } from '@fp-ts/core/function'
import * as O from '@fp-ts/core/Option'
import * as Z from '@effect/io/Effect'
import { ParseError } from '@fp-ts/schema/ParseResult'
import type { NonEmptyReadonlyArray } from '@fp-ts/core/ReadonlyArray'

const CONTENT_TYPE_RESPONSE_HEADER = 'content-type'
const CONTENT_TYPE_JSON = 'application/json'

class DecodingFailure {
  readonly _tag = 'DecodingFailure'
  constructor(readonly errors: NonEmptyReadonlyArray<ParseError>) {}
}

class GenericFetchError {
  readonly _tag = 'GenericFetchError'
  constructor(readonly message: string) {}
}

class HttpClientError {
  readonly _tag = 'HttpClientError'
  constructor(
    readonly statusCode: number,
    readonly data?: Record<string, unknown>,
  ) {}
}

class HttpServerError {
  readonly _tag = 'HttpClientError'
  constructor(
    readonly statusCode: number,
    readonly data?: Record<string, unknown>,
  ) {}
}

class NotJson {
  readonly _tag = 'NotJson'
}

class JsonParseError {
  readonly _tag = 'JsonParseError'
  constructor(readonly message: string) {}
}

export type FetchError =
  | GenericFetchError
  | DecodingFailure
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
      (message) => new GenericFetchError(message),
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

const matchResponse: (
  input: Response,
) => Z.Effect<
  never,
  HttpClientError | HttpServerError | JsonParseError | NotJson,
  JSON
> = pipe(
  Match.type<Response>(),
  Match.when({ status: statusCodeIs40x }, (r) =>
    Z.fail(new HttpClientError(r.status)),
  ),
  Match.when({ status: statusCodeIs50x }, (r) =>
    Z.fail(new HttpServerError(r.status)),
  ),
  Match.when({ headers: contentTypeIsJson }, (r) =>
    Z.tryCatchPromise(
      () => r.json() as Promise<JSON>,
      (error) =>
        new JsonParseError(
          error instanceof Error ? error.message : 'Unknown error.',
        ),
    ),
  ),
  Match.orElse(() => Z.fail(new NotJson())),
)

export const getJsonAndValidate =
  <A>(schema: S.Schema<A>) =>
  (response: Response): Z.Effect<never, FetchError, A> =>
    pipe(
      matchResponse(response),
      Z.flatMap((json) =>
        pipe(
          S.decode(schema)(json, { isUnexpectedAllowed: true }),
          E.mapLeft((errors) => new DecodingFailure(errors)),
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
