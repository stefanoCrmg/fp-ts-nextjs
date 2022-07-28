import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import * as styles from '../../styles/showPokemon.css'

type PokemonImage = {
  url: string
}

type PokemonUrlQuery = {
  pokemon: string
}

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon'

export const getServerSideProps: GetServerSideProps<
  PokemonImage,
  PokemonUrlQuery
> = async (context) => {
  const params = context.params
  return fetch(`${POKE_API_URL}/${params?.pokemon}`)
    .then((_) => _.json())
    .then((_) => ({
      props: { url: _.sprites.other.dream_world.front_default },
    }))
}

const ShowPokemon: NextPage<PokemonImage> = ({ url }) => {
  return (
    <div className={styles.gridContainer}>
      <div>
        <Image src={url} layout="responsive" width="30rem" height="30rem" />
      </div>
    </div>
  )
}

export default ShowPokemon
