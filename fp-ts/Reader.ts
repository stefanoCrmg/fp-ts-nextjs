import * as R from 'fp-ts/Reader'

export const runReader: <R, A>(r: R) => (reader: R.Reader<R, A>) => A =
  (r) => (reader) =>
    reader(r)

export * from 'fp-ts/Reader'
