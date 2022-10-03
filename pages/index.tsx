import type { NextPage } from 'next'
import { flow, pipe } from 'fp-ts/function'
import { GenericFetchError } from '@utils/fetch'
import { Select } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { findSymbol } from './repository/findSymbol'
import { getCandles } from './repository/getCandles'
import { useQueryRemoteData } from '@utils/useRemoteQuery'
import * as O from '@fp/Option'
import * as TE from '@fp/TaskEither'
import * as RD from '@devexperts/remote-data-ts'
import { useStableO } from 'fp-ts-react-stable-hooks'
import * as str from 'fp-ts/string'
import { NonEmptyString } from 'io-ts-types'
import * as V from 'victory'
import * as dateFns from 'date-fns/fp'

const showOptionString = O.getShow(str.Show)

const Home: NextPage = () => {
  const defaultStocks = [
    { value: 'AAPL', label: 'AAPL' },
    { value: 'IBM', label: 'IBM' },
  ]
  const [stock, setStock] = useStableO<NonEmptyString>(O.none)
  const [debouncedStockValue] = useDebouncedValue(stock, 200)
  const findSomeStocks = useQueryRemoteData(
    [showOptionString.show(debouncedStockValue)],
    () =>
      pipe(
        debouncedStockValue,
        TE.fromOption(() =>
          GenericFetchError({ message: 'Missing stock identifier' }),
        ),
        TE.chain(findSymbol),
        TE.unsafeUnwrap,
      ),
    { enabled: O.isSome(debouncedStockValue) },
  )

  const [selectedStock, setSelectedStock] = useStableO<string>(O.none)

  const findCandles = useQueryRemoteData(
    [`${showOptionString.show(selectedStock)}-candles`],
    () =>
      pipe(
        selectedStock,
        TE.fromOption(() =>
          GenericFetchError({ message: 'Missing stock identifier' }),
        ),
        TE.chain(getCandles),
        TE.unsafeUnwrap,
      ),
    { enabled: O.isSome(selectedStock) },
  )

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formElements = form.elements as typeof form.elements & {
      symbolSelector: { value: string }
    }
    setSelectedStock(O.some(formElements.symbolSelector.value))
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Select
          label={'Search a stock or crypto!'}
          id="symbolSelector"
          searchable
          onSearchChange={flow(NonEmptyString.decode, O.fromEither, setStock)}
          searchValue={O.toUndefined(stock)}
          data={pipe(
            findSomeStocks,
            RD.recover(({ staleData }) => staleData),
            RD.fold3(
              () => [],
              (err) => [],
              ({ results }) =>
                results.map(({ name, ticker }) => ({
                  value: name,
                  label: ticker,
                })),
            ),
          )}
        />
      </form>
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
                  candleColors={{ positive: '#5f5c5b', negative: '#c43a31' }}
                  data={candles}
                />
              </V.VictoryChart>
            ),
          ),
        )}
      </div>
    </div>
  )
}

export default Home
