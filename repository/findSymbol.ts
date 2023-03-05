import * as Z from '@effect/io/Effect'
import * as O from '@fp-ts/core/Option'
import { fetchAndValidate, FetchError, GenericFetchError } from '@utils/fetch'

import * as S from '@fp-ts/schema'
import { fromNullable as optionFromNullable } from '@fp-ts/schema/data/Option'
import { parseDate } from '@fp-ts/schema/data/String'
import { FrontendEnv } from '@utils/frontendEnv'
import { flow } from '@fp-ts/core/Function'

const Market = S.union(
  S.literal('stocks'),
  S.literal('otc'),
  S.literal('crypto'),
  S.literal('fx'),
)

const Ticker = S.struct({
  active: S.boolean,
  cik: optionFromNullable(S.string),
  composite_figi: optionFromNullable(S.string),
  currency_name: S.string,
  last_updated_utc: parseDate(S.string),
  locale: S.string,
  market: Market,
  name: S.string,
  primary_exchange: optionFromNullable(S.string),
  share_class_figi: optionFromNullable(S.string),
  ticker: S.string,
  type: S.string,
})

export interface Ticker extends S.Infer<typeof Ticker> {}

const TickerResponse = S.struct({
  count: S.number,
  next_url: optionFromNullable(S.string),
  request_id: S.string,
  results: S.array(Ticker),
  status: S.string,
})

export interface TickerResponse extends S.Infer<typeof TickerResponse> {}

const _findTickerEffect = (
  symbol: string,
): Z.Effect<FrontendEnv, FetchError, TickerResponse> =>
  Z.serviceWithEffect(FrontendEnv, ({ backendURL }) =>
    fetchAndValidate(TickerResponse, `${backendURL}/ticker?search=${symbol}`),
  )

export const findTicker: (
  stockValue: O.Option<string>,
) => Z.Effect<FrontendEnv, FetchError, TickerResponse> = flow(
  Z.fromOption,
  Z.mapError(() => GenericFetchError({ message: 'Missing stock identifier' })),
  Z.flatMap(_findTickerEffect),
)
