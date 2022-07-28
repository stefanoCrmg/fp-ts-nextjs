import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import * as styles from '../../styles/showPokemon.css'

type PokemonImage = {
  url: string
}

type PageProps = {
  pokemonImages: PokemonImage[]
}

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon'

type GeneratePokemonResponse = {
  count: number
  next: null | string
  previous: null | string
  results: ReadonlyArray<{ name: string; url: string }>
}

const generatePokemonAsync = async (
  limit: number,
  offset: number,
): Promise<GeneratePokemonResponse> =>
  fetch(`${POKE_API_URL}?limit=${limit}&offset=${offset}`).then((_) => _.json())

const getPokemonImage = async (url: string): Promise<PokemonImage> =>
  fetch(url)
    .then((_) => _.json())
    .then((_) => ({
      url: _.sprites.other.dream_world.front_default,
    }))

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const somePokemons = await generatePokemonAsync(365, 0)
  const allPokemonsImages = await Promise.all(
    somePokemons.results.map((_) => getPokemonImage(_.url)),
  )
  return { props: { pokemonImages: allPokemonsImages } }
}

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
