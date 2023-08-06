import * as Clock from 'effect/Clock'
import * as S from '@effect/schema/Schema'
import * as O from 'effect/Option'
import { fetchAndValidate, FetchError, GenericFetchError } from '@utils/fetch'
import * as Effect from 'effect/Effect'
import { FrontendEnv } from '@utils/frontendEnv'
import * as Duration from 'effect/Duration'
import { pipe, compose } from 'effect/Function'

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
    Effect.all(
      {
        backendURL: pipe(
          FrontendEnv,
          Effect.map((_) => _.backendURL),
        ),
        now: pipe(Clock.currentTimeMillis, Effect.map(Duration.millis)),
        before: pipe(
          Clock.currentTimeMillis,
          Effect.map(
            compose(Duration.millis, Duration.sum(Duration.days(-14))),
          ),
        ),
      },
      { concurrency: 'unbounded' },
    ),
    Effect.flatMap(({ now, before, backendURL }) =>
      fetchAndValidate(
        CandlesResponse,
        `${backendURL}/candle?symbol=${symbol}&timeframe=day&from=${Duration.toMillis(
          before,
        )}&to=${Duration.toMillis(now)}`,
      ),
    ),
  )

export const getCandles: (
  stockValue: O.Option<string>,
) => Effect.Effect<FrontendEnv, FetchError, CandlesResponse> = compose(
  Effect.mapError(() =>
    GenericFetchError({ message: 'Missing stock identifier' }),
  ),
  Effect.flatMap(_getCandlesEffect),
)
