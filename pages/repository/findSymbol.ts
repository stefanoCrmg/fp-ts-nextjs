import * as t from 'io-ts'
import { flow } from 'fp-ts/function'
import * as RTE from '@fp/ReaderTaskEither'
import * as O from '@fp/Option'
import { fetchAndValidate, FetchError, GenericFetchError } from '@utils/fetch'
import {
  DateFromISOString,
  NonEmptyString,
  optionFromNullable,
} from 'io-ts-types'
import { FrontendEnv } from '@utils/frontendEnv'

const Market = t.keyof({
  stocks: null,
  otc: null,
  crypto: null,
  fx: null,
})

const Ticker = t.readonly(
  t.type({
    active: t.boolean,
    cik: optionFromNullable(NonEmptyString),
    composite_figi: optionFromNullable(NonEmptyString),
    currency_name: NonEmptyString,
    last_updated_utc: DateFromISOString,
    locale: NonEmptyString,
    market: Market,
    name: NonEmptyString,
    primary_exchange: optionFromNullable(NonEmptyString),
    share_class_figi: optionFromNullable(NonEmptyString),
    ticker: NonEmptyString,
    type: NonEmptyString,
  }),
)
export interface Ticker extends t.TypeOf<typeof Ticker> {}

const TickerResponse = t.readonly(
  t.type({
    count: t.number,
    next_url: optionFromNullable(NonEmptyString),
    request_id: NonEmptyString,
    results: t.readonlyArray(Ticker),
    status: NonEmptyString,
  }),
)
export interface TickerResponse extends t.TypeOf<typeof TickerResponse> {}

const _findTickerTask = (
  symbol: NonEmptyString,
): RTE.ReaderTaskEither<FrontendEnv, FetchError, TickerResponse> =>
  RTE.asksTaskEither(({ backendURL }) =>
    fetchAndValidate(TickerResponse, `${backendURL}/ticker?search=${symbol}`),
  )

export const findTicker: (
  stockValue: O.Option<NonEmptyString>,
) => RTE.ReaderTaskEither<FrontendEnv, FetchError, TickerResponse> = flow(
  RTE.fromOption(() =>
    GenericFetchError({ message: 'Missing stock identifier' }),
  ),
  RTE.chain(_findTickerTask),
)
