import type { NextPage } from 'next'
import Image from 'next/image'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/function'
import * as TE from '@fp/TaskEither'
import * as styles from '../styles/Home.css'
import { fetchAndValidate, serializeFetchError } from '@utils/fetch'
import { useQueryRemoteData } from '@utils/useRemoteQuery'
import * as RD from '@devexperts/remote-data-ts'
import Link from 'next/link'

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
  const findTotodile = useQueryRemoteData(['totodile'], () =>
    getOnePokemon('totodile'),
  )

  return pipe(
    findTotodile,
    RD.fold3(
      () => <div>Loading...</div>,
      (failure) => <div>{JSON.stringify(serializeFetchError(failure))}</div>,
      (totodile) => (
        <Link href="/showPokemon/totodile" className={styles.container}>
          <Image
            src={totodile.sprites.other.dream_world.front_default}
            layout="fill"
          />
        </Link>
      ),
    ),
  )
}

export default Home
