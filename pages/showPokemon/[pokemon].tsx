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
  const svgUrl = await fetch(`${POKE_API_URL}/${params?.pokemon}`)
    .then((_) => _.json())
    .then((_) => ({
      url: _.sprites.other.dream_world.front_default as string,
    }))
  const svgImage = await fetch(svgUrl.url)
    .then((response) => response.text())
    .then((_) => `data:image/svg+xml;utf8,${encodeURIComponent(_)}`)
  return { props: { url: svgImage } }
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
