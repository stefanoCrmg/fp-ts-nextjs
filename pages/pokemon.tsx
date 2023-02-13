import * as Z from '@effect/io/Effect'
import { pipe } from 'fp-ts/function'
import * as S from '@fp-ts/schema'
import * as RD from '@devexperts/remote-data-ts'
import { FetchError, fetchAndValidate } from '@utils/fetch'
import { FrontendEnv } from '@utils/frontendEnv'
import { useQueryRemoteData } from '@utils/useRemoteQuery'
import { NextPage } from 'next/types'
import { container, content, pageContainer } from './pokemon.css'

const PokemonResponse = S.struct({
  name: S.string,
  sprites: S.struct({
    back_default: S.string,
    back_shiny: S.string,
    front_default: S.string,
    front_shiny: S.string,
  }),
})

type PokemonResponse = S.Infer<typeof PokemonResponse>
type PokemonComponent = {
  readonly imageUrl: string
  readonly name: string
}

const PokemonComponent: React.FC<PokemonComponent> = ({ imageUrl, name }) => (
  <div className={container}>
    <img className={content} src={imageUrl} />
    <div className="pokemonNames">
      <p className="highlight">EN: {name}</p>
      <p className="highlight">JP: ゲンガー</p>
    </div>
  </div>
)

const fetchPokemon = (
  pokemonName: string,
): Z.Effect<FrontendEnv, FetchError, PokemonResponse> =>
  Z.serviceWithEffect(FrontendEnv, ({ backendURL }) =>
    fetchAndValidate(PokemonResponse, `${backendURL}/pokemon/${pokemonName}`),
  )

const Pokemon: NextPage = () => {
  const gengarQry = useQueryRemoteData(['pokemon-gengar'], () =>
    fetchPokemon('gengar'),
  )
  const blisseyQry = useQueryRemoteData(['pokemon-blissey'], () =>
    fetchPokemon('blissey'),
  )

  const multiPokemons = RD.combine(gengarQry, blisseyQry)

  return (
    <div className={pageContainer}>
      {pipe(
        multiPokemons,
        RD.fold3(
          () => <p>Loading</p>,
          (e) => <p>Error: {JSON.stringify(e.error)}</p>,
          ([first, second]) => (
            <>
              <PokemonComponent
                imageUrl={first.sprites.front_shiny}
                name={first.name}
              />
              <PokemonComponent
                imageUrl={second.sprites.front_shiny}
                name={second.name}
              />
            </>
          ),
        ),
      )}
    </div>
  )
}

export default Pokemon
