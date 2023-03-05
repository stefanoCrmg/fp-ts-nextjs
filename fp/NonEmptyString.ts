import { Brand } from '@effect/data/Brand'
import { pipe } from '@effect/data/Function'
import * as S from '@effect/schema'
import { ParseOptions } from '@effect/schema/AST'
import { ParseResult } from '@effect/schema/ParseResult'

const _internal_nonEmptyStringS: S.Schema<string> = S.nonEmpty()(S.string)
export const NonEmptyString: S.Schema<string & Brand<'NonEmptyString'>> = pipe(
  _internal_nonEmptyStringS,
  S.brand('NonEmptyString'),
)
export type NonEmptyString = S.Infer<typeof NonEmptyString>
export const isNonEmptyString: (
  input: unknown,
  options?: ParseOptions | undefined,
) => ParseResult<string & Brand<'NonEmptyString'>> = S.decode(NonEmptyString)
