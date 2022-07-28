import type { NextPage } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as styles from '../styles/Home.css'

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon'

const Home: NextPage = () => {
  const [pokemonImage, setPokemonImage] = useState<string | null>(null)
  useEffect(() => {
    const getPokemon = async () =>
      fetch(`${POKE_API_URL}/totodile`)
        .then((_) => _.json())
        .then((_) => setPokemonImage(_.sprites.other.dream_world.front_default))
    getPokemon()
  })

  return (
    <div className={styles.container}>
      {pokemonImage && <Image src={pokemonImage} layout="fill" />}
    </div>
  )
}

export default Home
