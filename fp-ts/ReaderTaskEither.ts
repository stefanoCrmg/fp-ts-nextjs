import * as TE from 'fp-ts-std/TaskEither'
import * as RTE from 'fp-ts/ReaderTaskEither'

export const unsafeUnwrap =
  <R, A>(rte: RTE.ReaderTaskEither<R, unknown, A>) =>
  (r: R) =>
    TE.unsafeUnwrap(rte(r))
export * from 'fp-ts/ReaderTaskEither'
