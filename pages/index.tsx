import type { NextPage } from 'next'
import Image from 'next/image'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/function'
import * as TE from '../fp-ts/TaskEither'
import * as styles from '../styles/Home.css'
import {
  fetchAndValidate,
  GetJsonError,
  serializeJsonError,
} from '../utils/fetch-fp/Response'
import { useRemoteData } from '../utils/useRemoteQuery'
import * as RD from '@devexperts/remote-data-ts'

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon'

const Pokemon = t.readonly(
  t.type({
    sprites: t.type({
      other: t.type({
        dream_world: t.type({
          front_default: t.string,
        }),
      }),
    }),
  }),
  'Pokemon',
)

interface Pokemon extends t.TypeOf<typeof Pokemon> {}

const getOnePokemon = (pokemon: string): Promise<Pokemon> =>
  pipe(fetchAndValidate(Pokemon, `${POKE_API_URL}/${pokemon}`), TE.unsafeUnwrap)

const Home: NextPage = () => {
  const findTotodile = useRemoteData<Pokemon, GetJsonError>(['totodile'], () =>
    getOnePokemon('totodile'),
  )
  const findPikachu = useRemoteData<Pokemon, GetJsonError>(['pikachu'], () =>
    getOnePokemon('pikachu'),
  )

  return pipe(
    RD.combine(findTotodile, findPikachu),
    RD.fold3(
      () => <div>Loading...</div>,
      (failure) => <div>{JSON.stringify(serializeJsonError(failure))}</div>,
      ([totodile, pikachu]) => (
        <div className={styles.container}>
          <Image
            src={totodile.sprites.other.dream_world.front_default}
            layout="fill"
          />
          <Image
            src={pikachu.sprites.other.dream_world.front_default}
            layout="fill"
          />
        </div>
      ),
    ),
  )
}

export default Home
