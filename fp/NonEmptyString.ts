import { Brand } from '@effect/data/Brand'
import { pipe } from '@effect/data/Function'
import * as S from '@effect/schema/Schema'
import * as E from '@effect/data/Either'
import { ParseOptions } from '@effect/schema/AST'
import { ParseError } from '@effect/schema/ParseResult'

const _internal_nonEmptyStringS: S.Schema<string> = S.nonEmpty()(S.string)
export const NonEmptyString: S.Schema<
  string,
  string & Brand<'NonEmptyString'>
> = pipe(_internal_nonEmptyStringS, S.brand('NonEmptyString'))
export type NonEmptyString = S.To<typeof NonEmptyString>
export const isNonEmptyString: (
  input: unknown,
  options?: ParseOptions | undefined,
) => E.Either<ParseError, NonEmptyString> = S.parseEither(NonEmptyString)
