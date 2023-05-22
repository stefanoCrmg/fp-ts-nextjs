import * as Clock from '@effect/io/Clock'
import * as S from '@effect/schema/Schema'
import * as O from '@effect/data/Option'
import { fetchAndValidate, FetchError, GenericFetchError } from '@utils/fetch'
import * as Effect from '@effect/io/Effect'
import { FrontendEnv } from '@utils/frontendEnv'
import * as Duration from '@effect/data/Duration'
import { pipe, flow } from '@effect/data/Function'

export const Candles = S.struct({
  closePrice: S.number,
  highPrice: S.number,
  lowPrice: S.number,
  openPrice: S.number,
  volume: S.number,
})
export interface Candles extends S.To<typeof Candles> {}

export const CandlesResponse = S.struct({
  results: S.array(Candles),
  tickerName: S.string,
})

export interface CandlesResponse extends S.To<typeof CandlesResponse> {}

const _getCandlesEffect = (
  symbol: string,
): Effect.Effect<FrontendEnv, FetchError, CandlesResponse> =>
  pipe(
    Effect.allPar({
      backendURL: pipe(
        FrontendEnv,
        Effect.map((_) => _.backendURL),
      ),
      now: pipe(Clock.currentTimeMillis(), Effect.map(Duration.millis)),
      before: pipe(
        Clock.currentTimeMillis(),
        Effect.map(flow(Duration.millis, Duration.subtract(Duration.days(14)))),
      ),
    }),
    Effect.flatMap(({ now, before, backendURL }) =>
      fetchAndValidate(
        CandlesResponse,
        `${backendURL}/candle?symbol=${symbol}&timeframe=day&from=${before.millis}&to=${now.millis}`,
      ),
    ),
  )

export const getCandles: (
  stockValue: O.Option<string>,
) => Effect.Effect<FrontendEnv, FetchError, CandlesResponse> = flow(
  Effect.mapError(() => GenericFetchError({ message: 'Missing stock identifier' })),
  Effect.flatMap(_getCandlesEffect),
)
