import type { NextPage } from 'next'
import { flow, pipe } from 'fp-ts/function'
import { useDebouncedValue } from '@mantine/hooks'
import { findTicker } from '../repository/findSymbol'
import { getCandles } from '../repository/getCandles'
import {
  useMutationRemoteData,
  useQueryRemoteData,
} from '@utils/useRemoteQuery'
import * as O from '@fp/Option'
import * as RD from '@devexperts/remote-data-ts'
import { useStableO } from 'fp-ts-react-stable-hooks'
import * as str from 'fp-ts/string'
import { NonEmptyString } from 'io-ts-types'
import * as V from 'victory'
import * as dateFns from 'date-fns/fp'
import { Combobox } from '@headlessui/react'
import { fetchAndValidate, FetchError } from '@utils/fetch'
import * as t from 'io-ts'
import * as RTE from '@fp/ReaderTaskEither'
import { serialize } from '@unsplash/sum-types'
import { HelloWorldTitle } from '../styles/index.css'
import { ThemeToggle } from '../components/themeAtom'
import { FrontendEnv } from '../utils/frontendEnv'

const showOptionString = O.getShow(str.Show)

export const fakePostBody = t.type({ name: t.string }, 'FakePostBody')
export interface FakePostBody extends t.TypeOf<typeof fakePostBody> {}

const Home: NextPage = () => {
  const [stock, setStock] = useStableO<NonEmptyString>(O.none)
  const [selectedStock, setSelectedStock] = useStableO<string>(O.none)
  const [debouncedStockValue] = useDebouncedValue(stock, 200)

  const findSomeStocks = useQueryRemoteData(
    [showOptionString.show(debouncedStockValue)],
    () => findTicker(debouncedStockValue),
    { enabled: O.isSome(debouncedStockValue) },
  )

  const findCandles = useQueryRemoteData(
    [`${showOptionString.show(selectedStock)}-candles`],
    () => getCandles(selectedStock),
    { enabled: O.isSome(selectedStock) },
  )

  const fakePostTask = (
    body: FakePostBody,
  ): RTE.ReaderTaskEither<FrontendEnv, FetchError, { name: string }> =>
    RTE.asksTaskEither(({ nextEdgeFunctionURL }) =>
      pipe(
        fetchAndValidate(fakePostBody, `${nextEdgeFunctionURL}/hello`, {
          method: 'POST',
          body: JSON.stringify(fakePostBody.encode(body)),
        }),
      ),
    )

  const mutation = useMutationRemoteData(['first-mutation'], fakePostTask)
  return (
    <div>
      {/* className="text-3xl font-bold text-red-500" */}
      <h1 className={HelloWorldTitle}>Hello world!</h1>
      <ThemeToggle />
      <button onClick={() => mutation.mutate({ name: 'MioBody' })}>
        Post me
      </button>
      {pipe(
        mutation.lifeCycle,
        RD.fold(
          () => <div>Idle</div>,
          () => <div>Loading</div>,
          (fetchErr) => (
            <div>{JSON.stringify(serialize<FetchError>(fetchErr))}</div>
          ),
          ({ name }) => <div>{name}</div>,
        ),
      )}
      <Combobox
        value={O.toNullable(selectedStock)}
        onChange={flow(O.fromNullable, setSelectedStock)}
      >
        <Combobox.Input
          onChange={(event) =>
            pipe(
              event.target.value,
              NonEmptyString.decode,
              O.fromEither,
              setStock,
            )
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
