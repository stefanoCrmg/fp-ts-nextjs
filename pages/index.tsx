import type { NextPage } from 'next'
import { compose, pipe } from 'effect/Function'
import { useDebouncedValue } from '@mantine/hooks'
import { findTicker } from '../repository/findSymbol'
import { getCandles } from '../repository/getCandles'
import {
  useMutationRemoteData,
  useQueryRemoteData,
} from '@utils/useRemoteQuery'
import * as O from 'effect/Option'
import * as RD from '@devexperts/remote-data-ts'
import * as Effect from 'effect/Effect'
import * as S from '@effect/schema/Schema'
import { useStableO } from '@fp/ReactStableHooks'
import * as V from 'victory'
import * as dateFns from 'date-fns/fp'
import { Combobox } from '@headlessui/react'
import { EncodingFailure, fetchAndValidate, FetchError } from '@utils/fetch'
import { ThemeToggle } from '../components/themeAtom'
import { FrontendEnv } from '../utils/frontendEnv'
import { isNonEmptyString, NonEmptyString } from '@fp/NonEmptyString'
import { sprinkles } from 'styles/sprinkles.css'

export const fakePostBody = S.struct({ name: S.string })
export interface FakePostBody extends S.To<typeof fakePostBody> {}

const Home: NextPage = () => {
  const [stock, setStock] = useStableO<NonEmptyString>(O.none())
  const [selectedStock, setSelectedStock] = useStableO<NonEmptyString>(O.none())
  const [debouncedStockValue] = useDebouncedValue(stock, 200)

  const findSomeStocks = useQueryRemoteData(
    [O.getOrNull(debouncedStockValue)],
    findTicker(debouncedStockValue),
    { enabled: O.isSome(debouncedStockValue) },
  )

  const findCandles = useQueryRemoteData(
    [`${O.getOrNull(selectedStock)}-candles`],
    getCandles(selectedStock),
    { enabled: O.isSome(selectedStock) },
  )

  const fakePostTask: (
    body: FakePostBody,
  ) => Effect.Effect<FrontendEnv, FetchError, FakePostBody> = (
    body: FakePostBody,
  ) =>
    pipe(
      FrontendEnv,
      Effect.flatMap(({ nextEdgeFunctionURL }) =>
        pipe(
          body,
          S.encode(fakePostBody),
          Effect.mapError((errors) => EncodingFailure({ errors: [errors] })),
          Effect.flatMap((body) =>
            fetchAndValidate(fakePostBody, `${nextEdgeFunctionURL}/hello`, {
              method: 'POST',
              body: JSON.stringify(body),
            }),
          ),
        ),
      ),
    )

  const mutation = useMutationRemoteData(['first-mutation'], fakePostTask)
  return (
    <div>
      <h1 className={sprinkles({ fontSize: 'size2', color: 'green-5' })}>
        Hello world!
      </h1>
      <ThemeToggle />
      <button onClick={() => mutation.mutate({ name: 'MioBody' })}>
        Post me
      </button>
      {pipe(
        mutation.lifeCycle,
        RD.fold(
          () => <div>Idle</div>,
          () => <div>Loading</div>,
          (fetchErr) => <div>{JSON.stringify(fetchErr)}</div>,
          ({ name }) => <div>{name}</div>,
        ),
      )}
      <Combobox
        value={O.getOrNull(selectedStock)}
        onChange={compose(O.fromNullable, setSelectedStock)}
      >
        <Combobox.Input
          onChange={(event) =>
            pipe(event.target.value, isNonEmptyString, O.getRight, setStock)
          }
        />
        <Combobox.Options>
          {pipe(
            findSomeStocks,
            RD.recover(({ staleData }) => staleData),
            RD.fold3(
              () => [],
              () => [],
              ({ results }) =>
                results.map(({ name, ticker }, i) => (
                  <Combobox.Option key={`stock-${i}`} value={ticker}>
                    {name}
                  </Combobox.Option>
                )),
            ),
          )}
        </Combobox.Options>
      </Combobox>
      <div>
        {pipe(
          findCandles,
          RD.map((candles) =>
            candles.results.map((_, index) => ({
              x: dateFns.subDays(index)(new Date()),
              open: _.openPrice,
              close: _.closePrice,
              high: _.highPrice,
              low: _.lowPrice,
            })),
          ),
          RD.fold3(
            () => <div>No Data</div>,
            () => <div>No Data</div>,
            (candles) => (
              <div className="flex flex-col justify-center items-center">
                <div className="w-full max-w-2xl">
                  <V.VictoryChart
                    theme={V.VictoryTheme.material}
                    domainPadding={{ x: 10 }}
                    scale={{ x: 'time' }}
                  >
                    <V.VictoryAxis
                      tickFormat={(t) => `${t.getDate()}/${t.getMonth()}`}
                    />
                    <V.VictoryAxis dependentAxis />
                    <V.VictoryCandlestick
                      candleColors={{
                        positive: '#5f5c5b',
                        negative: '#c43a31',
                      }}
                      data={candles}
                    />
                  </V.VictoryChart>
                </div>
              </div>
            ),
          ),
        )}
      </div>
    </div>
  )
}

export default Home
