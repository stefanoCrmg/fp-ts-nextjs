import type { Reader } from 'fp-ts/Reader'

export const runReader: <R, A>(r: R) => (reader: Reader<R, A>) => A =
  (r) => (reader) =>
    reader(r)

export * from 'fp-ts/Reader'
