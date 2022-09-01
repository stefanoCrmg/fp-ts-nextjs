import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import * as styles from '../../styles/showPokemon.css'
import * as t from 'io-ts'
import * as TE from '@fp/TaskEither'
import * as RTE from '@fp/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import { ProjectEnv } from '@utils/makeEnv'
import { fetchAndValidate, FetchError } from '@utils/fetch'

type PokemonImage = {
  url: string
}

type PageProps = {
  pokemonImages: ReadonlyArray<PokemonImage>
}
const SomePokemon = t.readonly(
  t.type({
    count: t.number,
    next: t.union([t.null, t.string]),
    previous: t.union([t.null, t.string]),
    results: t.readonlyArray(t.type({ name: t.string })),
  }),
  'SomePokemon',
)
type SomePokemon = t.TypeOf<typeof SomePokemon>

const generatePokemonAsync = (
  limit: number,
  offset: number,
): RTE.ReaderTaskEither<ProjectEnv, FetchError, SomePokemon> =>
  RTE.asksTaskEither(({ pokemonAPI }) =>
    fetchAndValidate(
      SomePokemon,
      `${pokemonAPI}?limit=${limit}&offset=${offset}`,
    ),
  )

const getPokemonImage = (
  pokemon: string,
): RTE.ReaderTaskEither<ProjectEnv, Error, PokemonImage> =>
  RTE.asksTaskEither(({ pokemonAPI }) =>
    TE.tryCatch(
      () =>
        fetch(`${pokemonAPI}/${pokemon}`)
          .then((_) => _.json())
          .then((_) => ({
            url: _.sprites.other.dream_world.front_default,
          })),
      (e) => new Error(JSON.stringify(e)),
    ),
  )

export const getServerSideProps: GetServerSideProps<PageProps> = async () =>
  pipe(
    generatePokemonAsync(3, 0),
    RTE.chainW((pokemonList) =>
      pipe(
        pokemonList.results,
        RTE.traverseArray(({ name }) => getPokemonImage(name)),
        RTE.map((pokemonImages) => ({ props: { pokemonImages } })),
      ),
    ),
    RTE.runReaderUnsafeUnwrap(ProjectEnv),
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
