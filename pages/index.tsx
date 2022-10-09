import type { NextPage } from 'next'
import { flow, pipe } from 'fp-ts/function'
import { useDebouncedValue } from '@mantine/hooks'
import { findSymbol } from './repository/findSymbol'
import { getCandles } from './repository/getCandles'
import { useQueryRemoteData } from '@utils/useRemoteQuery'
import * as O from '@fp/Option'
import * as RD from '@devexperts/remote-data-ts'
import { useStableO } from 'fp-ts-react-stable-hooks'
import * as str from 'fp-ts/string'
import { NonEmptyString } from 'io-ts-types'
import * as V from 'victory'
import * as dateFns from 'date-fns/fp'
import { Combobox } from '@headlessui/react'

const showOptionString = O.getShow(str.Show)

const Home: NextPage = () => {
  const [stock, setStock] = useStableO<NonEmptyString>(O.none)
  const [selectedStock, setSelectedStock] = useStableO<string>(O.none)
  const [debouncedStockValue] = useDebouncedValue(stock, 200)

  const findSomeStocks = useQueryRemoteData(
    [showOptionString.show(debouncedStockValue)],
    () => findSymbol(debouncedStockValue),
    { enabled: O.isSome(debouncedStockValue) },
  )

  const findCandles = useQueryRemoteData(
    [`${showOptionString.show(selectedStock)}-candles`],
    () => getCandles(selectedStock),
    { enabled: O.isSome(selectedStock) },
  )

  return (
    <div>
      <h1 className="text-3xl font-bold text-red-500">Hello world!</h1>
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
              (err) => [],
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
            (err) => <div>No Data</div>,
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
