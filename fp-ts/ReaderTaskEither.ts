import * as stdTE from 'fp-ts-std/TaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from './Reader'

export const unsafeUnwrap =
  <R, A>(rte: RTE.ReaderTaskEither<R, unknown, A>) =>
  (r: R) =>
    stdTE.unsafeUnwrap(rte(r))

export const asksTaskEither: <R, E, A>(
  f: (r: R) => TE.TaskEither<E, A>,
) => RTE.ReaderTaskEither<R, E, A> = (f) => (r) => f(r)

export const asksTaskEitherW: <R, E1, E2, A>(
  f: (r: R) => TE.TaskEither<E2, A>,
) => RTE.ReaderTaskEither<R, E1 | E2, A> = asksTaskEither

export const runReader: <R, E, A>(
  r: R,
) => (rte: RTE.ReaderTaskEither<R, E, A>) => TE.TaskEither<E, A> = R.runReader

export const runReaderUnsafeUnwrap: <R, A>(
  r: R,
) => (rte: RTE.ReaderTaskEither<R, unknown, A>) => Promise<A> = (r) => (rte) =>
  unsafeUnwrap(rte)(r)

export * from 'fp-ts/ReaderTaskEither'
