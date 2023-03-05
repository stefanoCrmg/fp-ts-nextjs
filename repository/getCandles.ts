import { flow, pipe } from 'fp-ts/function'
import * as Clock from '@effect/io/Clock'
import * as S from '@fp-ts/schema'
import * as O from '@fp/Option'
import { fetchAndValidate, FetchError, GenericFetchError } from '@utils/fetch'
import * as Z from '@effect/io/Effect'
import { FrontendEnv } from '@utils/frontendEnv'
import * as Duration from '@effect/data/Duration'

export const Candles = S.struct({
  closePrice: S.number,
  highPrice: S.number,
  lowPrice: S.number,
  openPrice: S.number,
  volume: S.number,
})
export interface Candles extends S.Infer<typeof Candles> {}

export const CandlesResponse = S.struct({
  results: S.array(Candles),
  tickerName: S.string,
})

export interface CandlesResponse extends S.Infer<typeof CandlesResponse> {}

const _getCandlesEffect = (
  symbol: string,
): Z.Effect<FrontendEnv, FetchError, CandlesResponse> =>
  Z.serviceWithEffect(FrontendEnv, ({ backendURL }) =>
    pipe(
      Z.structPar({
        now: pipe(Clock.currentTimeMillis(), Z.map(Duration.millis)),
        before: pipe(
          Clock.currentTimeMillis(),
          Z.map(flow(Duration.millis, Duration.subtract(Duration.days(14)))),
        ),
      }),
      Z.flatMap(({ now, before }) =>
        fetchAndValidate(
          CandlesResponse,
          `${backendURL}/candle?symbol=${symbol}&timeframe=day&from=${before.millis}&to=${now.millis}`,
        ),
      ),
    ),
  )

export const getCandles: (
  stockValue: O.Option<string>,
) => Z.Effect<FrontendEnv, FetchError, CandlesResponse> = flow(
  Z.fromOption,
  Z.mapError(() => GenericFetchError({ message: 'Missing stock identifier' })),
  Z.flatMap(_getCandlesEffect),
)
