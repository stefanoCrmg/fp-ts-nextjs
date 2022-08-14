import type { NextPage } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/function'
import * as TE from '../fp-ts/TaskEither'
import * as styles from '../styles/Home.css'
import { fetchAndValidate, GetJsonError } from '../utils/request-frp/Response'
import { execute } from 'fp-ts-std/Task'

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
const getOnePokemon = fetchAndValidate(Pokemon, `${POKE_API_URL}/totodile`)

const Home: NextPage = () => {
  const [pokemonImage, setPokemonImage] = useState<string | null>(null)
  const [__pokemonError, setError] = useState<GetJsonError | null>(null)
  useEffect(() => {
    pipe(
      getOnePokemon,
      TE.match(setError, (pkmn) =>
        setPokemonImage(pkmn.sprites.other.dream_world.front_default),
      ),
      execute,
    )
  }, [])

  return (
    <div className={styles.container}>
      {pokemonImage && <Image src={pokemonImage} layout="fill" />}
    </div>
  )
}

export default Home
