import { apply } from 'fp-ts/function'
import type { Reader } from 'fp-ts/Reader'

export const runReader: <R, A>(r: R) => (reader: Reader<R, A>) => A = apply

export * from 'fp-ts/Reader'
