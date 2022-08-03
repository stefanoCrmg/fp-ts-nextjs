import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import * as styles from '../../styles/showPokemon.css'
import * as t from 'io-ts'
import { formatValidationErrors } from 'io-ts-reporters'
import * as TE from '../../fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as RTE from '../../fp-ts/ReaderTaskEither'
import { flow, pipe } from 'fp-ts/function'
import { ProjectEnv } from '../../util/makeEnv'

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
)
type SomePokemon = t.TypeOf<typeof SomePokemon>

const generatePokemonAsync = (
  limit: number,
  offset: number,
): RTE.ReaderTaskEither<ProjectEnv, Error, SomePokemon> =>
  RTE.asksTaskEither(({ pokemonAPI }) =>
    pipe(
      TE.tryCatch(
        () =>
          fetch(`${pokemonAPI}?limit=${limit}&offset=${offset}`)
            .then((_) => _.json())
            .then((_) => _),
        (_) => new Error('generatePokemonAsyncError'),
      ),
      TE.chainEitherKW(
        flow(
          SomePokemon.decode,
          E.mapLeft(
            (decodingFailure) =>
              new Error(
                `Decoding Failure: ${formatValidationErrors(decodingFailure)}`,
              ),
          ),
        ),
      ),
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
    RTE.unsafeUnwrap,
  )(ProjectEnv)

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
