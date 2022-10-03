import * as t from 'io-ts'
import { flow, pipe } from 'fp-ts/function'
import * as RTE from '@fp/ReaderTaskEither'
import * as TE from '@fp/TaskEither'
import * as IO from '@fp/IO'
import { fetchAndValidate, FetchError } from '@utils/fetch'
import * as stdD from 'fp-ts-std/Date'
import { NonEmptyString } from 'io-ts-types'
import { FrontendEnv } from '@utils/frontendEnv'
import * as dateFns from 'date-fns/fp'

export const Candles = t.readonly(
  t.type({
    closePrice: t.number,
    highPrice: t.number,
    lowPrice: t.number,
    openPrice: t.number,
    volume: t.number,
  }),
  'Candles',
)
export interface Candles extends t.TypeOf<typeof Candles> {}

export const CandlesResponse = t.readonly(
  t.type({
    results: t.readonlyArray(Candles),
    tickerName: NonEmptyString,
  }),
)
export interface CandlesResponse extends t.TypeOf<typeof CandlesResponse> {}

export const getCandlesTask = (
  symbol: string,
): RTE.ReaderTaskEither<FrontendEnv, FetchError, CandlesResponse> =>
  RTE.asksTaskEither(({ backendURL }) =>
    pipe(
      IO.Do,
      IO.apS('now', pipe(stdD.now, IO.map(stdD.unMilliseconds))),
      IO.apS(
        'before',
        pipe(
          stdD.now,
          IO.map(
            flow(
              stdD.fromMilliseconds,
              dateFns.subDays(14),
              stdD.getTime,
              stdD.unMilliseconds,
            ),
          ),
        ),
      ),
      TE.fromIO,
      TE.chain(({ now, before }) =>
        fetchAndValidate(
          CandlesResponse,
          `${backendURL}/candle?symbol=${symbol}&timeframe=day&from=${before}&to=${now}`,
        ),
      ),
    ),
  )

export const getCandles: (
  symbol: string,
) => TE.TaskEither<FetchError, CandlesResponse> = flow(
  getCandlesTask,
  RTE.runReader(FrontendEnv),
)
