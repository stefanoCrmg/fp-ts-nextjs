/* adapted from https://github.com/unsplash/request-frp */
import { formatValidationErrors } from 'io-ts-reporters'
import * as ContentTypeHelpers from 'content-type'
import * as E from 'fp-ts/Either'
import * as IOE from 'fp-ts/IOEither'
import * as IO from '@fp/IO'
import * as C from 'fp-ts/Console'
import * as t from 'io-ts'
import { constVoid, flow, pipe } from 'fp-ts/function'
import * as O from '@fp/Option'
import * as TE from '@fp/TaskEither'
import {
  Member,
  create,
  _,
  serialize,
  Serialized,
  deserialize,
} from '@unsplash/sum-types'
import { match } from 'ts-pattern'
import { Json } from 'fp-ts/Json'
import { NonEmptyString } from 'io-ts-types'
import * as pc from 'picocolors'

const CONTENT_TYPE_RESPONSE_HEADER = 'content-type'
const CONTENT_TYPE_JSON = 'application/json'

export type DecodingFailure = Member<'DecodingFailure', { errors: t.Errors }>
export type GenericFetchError = Member<'GenericFetchError', { message: string }>
export type FetchError =
  | Member<
      'HttpClientError',
      { statusCode: number; data?: Record<string, unknown> }
    >
  | Member<
      'HttpServerError',
      { statusCode: number; data?: Record<string, unknown> }
    >
  | Member<'NotJson'>
  | Member<'JsonParseError', { message: string }>
  | GenericFetchError
  | DecodingFailure

export const {
  mk: { GenericFetchError },
} = create<GenericFetchError>()

export const {
  mk: {
    JsonParseError,
    NotJson,
    DecodingFailure,
    HttpClientError,
    HttpServerError,
  },
  match: matchFetchError,
} = create<FetchError>()

export const serializeFetchError: (f: FetchError) => Serialized<FetchError> =
  serialize<FetchError>
export const deserializeFetchError: () => (
  se: Serialized<FetchError>,
) => FetchError = deserialize<FetchError>

export const observeDecodingFailure =
  (additionalInfo?: string) =>
  <A>(someFailure: E.Either<FetchError, A>): IOE.IOEither<FetchError, A> =>
    pipe(
      someFailure,
      IOE.fromEither,
      IOE.orElseFirstIOK(
        flow(
          IO.of,
          IO.chainFirst(() =>
            IO.when(NonEmptyString.is(additionalInfo))(C.log(additionalInfo)),
          ),
          IO.chain(
            matchFetchError({
              DecodingFailure: ({ errors }) =>
                pipe(errors, formatValidationErrors, C.error),
              [_]: () => constVoid,
            }),
          ),
        ),
      ),
    )

export const fromFetch: (
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
) => TE.TaskEither<GenericFetchError, Response> = TE.tryCatchK(
  fetch,
  flow(
    (error) => (error instanceof Error ? error.message : 'Unknown error.'),
    (message) => GenericFetchError({ message }),
  ),
)

const responseIsJson: (response: Response) => boolean = flow(
  (response: Response) => response.headers.get(CONTENT_TYPE_RESPONSE_HEADER),
  O.fromNullable,
  O.map(flow(ContentTypeHelpers.parse, (result) => result.type)),
  O.exists((type) => type === CONTENT_TYPE_JSON),
)
const responseIs40x = (response: Response): boolean =>
  response.status >= 400 && response.status <= 451
const responseIs50x = (response: Response): boolean =>
  response.status >= 500 && response.status <= 511

export const getJson = (response: Response): TE.TaskEither<FetchError, Json> =>
  match(response)
    .when(responseIs40x, (r) =>
      TE.left(HttpClientError({ statusCode: r.status })),
    )
    .when(responseIs50x, (r) =>
      TE.left(HttpServerError({ statusCode: r.status })),
    )
    .when(responseIsJson, (r) =>
      TE.tryCatch(
        () => r.json() as Promise<Json>,
        (error) =>
          JsonParseError({
            message: error instanceof Error ? error.message : 'Unknown error.',
          }),
      ),
    )
    .otherwise(() => TE.left(NotJson()))

export const validateJson =
  <A, O = A>(codec: t.Type<A, O, unknown>, additionalInfo?: string) =>
  (task: TE.TaskEither<FetchError, Json>): TE.TaskEither<FetchError, A> =>
    pipe(
      task,
      TE.chainIOEitherK(
        flow(
          codec.decode,
          E.mapLeft((errors) => DecodingFailure({ errors })),
          observeDecodingFailure(additionalInfo),
        ),
      ),
    )

export const getJsonAndValidate =
  <A, O = A>(codec: t.Type<A, O, unknown>, additionalInfo?: string) =>
  (response: Response): TE.TaskEither<FetchError, A> =>
    pipe(
      getJson(response),
      TE.chainIOEitherK(
        flow(
          codec.decode,
          E.mapLeft((errors) => DecodingFailure({ errors })),
          observeDecodingFailure(additionalInfo),
        ),
      ),
    )

export const fetchAndValidate = <A, O = A>(
  codec: t.Type<A, O, unknown>,
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
): TE.TaskEither<FetchError, A> =>
  pipe(
    fromFetch(input, init),
    TE.chain(
      getJsonAndValidate(
        codec,
        `While requesting ${pc.blue(pc.underline(codec.name))} from ${pc.yellow(
          input.toString(),
        )} I got some errors:`,
      ),
    ),
  )
