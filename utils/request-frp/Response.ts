/* adapted from https://github.com/unsplash/request-frp */
import { formatValidationErrors } from 'io-ts-reporters'
import * as ContentTypeHelpers from 'content-type'
import * as E from 'fp-ts/Either'
import * as IOE from 'fp-ts/IOEither'
import * as IO from '../../fp-ts/IO'
import * as C from 'fp-ts/Console'
import * as t from 'io-ts'
import { constVoid, flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import { Member, create, _, serialize } from '@unsplash/sum-types'
import { Json } from 'fp-ts/Json'
import { NonEmptyString } from 'io-ts-types'
import * as pc from 'picocolors'

const CONTENT_TYPE_RESPONSE_HEADER = 'content-type'
const CONTENT_TYPE_JSON = 'application/json'

export type DecodingFailure = Member<'DecodingFailure', { errors: t.Errors }>
export type FetchError = Member<'FetchError', { message: string }>
export type GetJsonError =
  | Member<'NotJson'>
  | Member<'JsonParseError', { message: string }>
  | FetchError
  | DecodingFailure

const {
  mk: { JsonParseError, NotJson, DecodingFailure },
  match: matchGetJsonError,
} = create<GetJsonError>()

export const serializeJsonError = serialize<GetJsonError>
const {
  mk: { FetchError },
} = create<FetchError>()

export const observeDecodingFailure: (
  additionalInfo?: string,
) => <A>(either: E.Either<GetJsonError, A>) => IOE.IOEither<GetJsonError, A> = (
  additionalInfo,
) =>
  flow(
    IOE.fromEither,
    IOE.orElseFirstIOK(
      flow(
        IO.of,
        IO.chainFirst(() =>
          IO.when(NonEmptyString.is(additionalInfo))(C.log(additionalInfo)),
        ),
        IO.chain(
          matchGetJsonError({
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
) => TE.TaskEither<FetchError, Response> = TE.tryCatchK(
  fetch,
  flow(
    (error) => (error instanceof Error ? error.message : 'Unknown error.'),
    (message) => FetchError({ message }),
  ),
)

const checkIsJson: (response: Response) => boolean = flow(
  (response: Response) => response.headers.get(CONTENT_TYPE_RESPONSE_HEADER),
  O.fromNullable,
  O.map(flow(ContentTypeHelpers.parse, (result) => result.type)),
  O.exists((type) => type === CONTENT_TYPE_JSON),
)

export const getJson = (
  response: Response,
): TE.TaskEither<GetJsonError, Json> =>
  checkIsJson(response)
    ? TE.tryCatch(
        () => response.json() as Promise<Json>,
        (error) =>
          JsonParseError({
            message: error instanceof Error ? error.message : 'Unknown error.',
          }),
      )
    : TE.left(NotJson())

export const getJsonAndValidate = <A, O = A>(
  codec: t.Type<A, O, unknown>,
  additionalInfo?: string,
): ((r: Response) => TE.TaskEither<GetJsonError, A>) =>
  flow(
    getJson,
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
): TE.TaskEither<GetJsonError, A> =>
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
