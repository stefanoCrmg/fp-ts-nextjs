import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import * as styles from '../../styles/showPokemon.css'
import * as RA from 'fp-ts/ReadonlyArray'
import * as O from '@fp/Option'
import { pipe } from 'fp-ts/function'
import Link from 'next/link'

type PokemonImage = {
  url: string
  color: string
}

type PokemonUrlQuery = {
  pokemon: string
}

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon'
const arrayOfColors = [
  '#293462',
  '#1CD6CE',
  '#FEDB39',
  '#D61C4E',
  '#3B9AE1',
  '#FCE2DB',
  '#2B4865',
  '#CCD6A6',
  '#000000',
]

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

  const randomElement = Math.floor(Math.random() * arrayOfColors.length)
  const selectedColor = pipe(
    arrayOfColors,
    RA.lookup(randomElement),
    O.getOrElse(() => '#FF5B00'),
  )

  return { props: { url: svgImage, color: selectedColor } }
}

const ShowPokemon: NextPage<PokemonImage> = ({ url, color }) => {
  return (
    <Link href="/">
      <div className={styles.gridContainer}>
        <div style={{ backgroundColor: color }}>
          <Image src={url} layout="responsive" width="30rem" height="30rem" />
        </div>
      </div>
    </Link>
  )
}

export default ShowPokemon
