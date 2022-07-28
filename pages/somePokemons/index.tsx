import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import * as styles from '../../styles/showPokemon.css'
import * as TE from '../../fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon'

type PokemonImage = {
  url: string
}

type PageProps = {
  pokemonImages: ReadonlyArray<PokemonImage>
}

type GeneratePokemonResponse = {
  count: number
  next: null | string
  previous: null | string
  results: ReadonlyArray<{ name: string; url: string }>
}

const generatePokemonAsync = (
  limit: number,
  offset: number,
): TE.TaskEither<Error, GeneratePokemonResponse> =>
  TE.tryCatch(
    () =>
      fetch(`${POKE_API_URL}?limit=${limit}&offset=${offset}`)
        .then((_) => _.json())
        .then((_) => _ as GeneratePokemonResponse),
    (_) => new Error('generatePokemonAsyncError'),
  )

const getPokemonImage = (url: string): TE.TaskEither<Error, PokemonImage> =>
  TE.tryCatch(
    () =>
      fetch(url)
        .then((_) => _.json())
        .then((_) => ({
          url: _.sprites.other.dream_world.front_default,
        })),
    () => new Error('getPokemonImageError'),
  )

export const getServerSideProps: GetServerSideProps<PageProps> = async () =>
  pipe(
    generatePokemonAsync(50, 0),
    TE.chain((pokemonList) =>
      pipe(
        pokemonList.results,
        TE.traverseArray(({ url }) => getPokemonImage(url)),
      ),
    ),
    TE.map((_) => ({ props: { pokemonImages: _ } })),
    TE.unsafeUnwrap,
  )

const SomePokemons: NextPage<PageProps> = ({ pokemonImages }) => {
  return (
    <div className={styles.gridContainer}>
      {pokemonImages.map((pokemon, index) => (
        <Image
          key={`${index}-pokemon`}
          src={pokemon.url}
          layout="responsive"
          width="30rem"
          height="30rem"
          alt="pokemon"
        />
      ))}
    </div>
  )
}

export default SomePokemons
