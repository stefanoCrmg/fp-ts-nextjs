import * as Z from '@effect/io/Effect'
import * as S from '@effect/schema'
import * as RD from '@devexperts/remote-data-ts'
import { FetchError, fetchAndValidate } from '@utils/fetch'
import { FrontendEnv } from '@utils/frontendEnv'
import { useQueryRemoteData } from '@utils/useRemoteQuery'
import { NextPage } from 'next/types'
import {
  gridContainer,
  gridContainerDelimiter,
  gridElement,
  overlayGridContainer,
  overlayGridItem,
  showGrid,
} from './style.css'
import { pipe } from '@effect/data/Function'

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
  <div className={gridElement}>
    <img src={imageUrl} />
    <div className="pokemonNames">
      <p className="highlight">EN: {name}</p>
    </div>
  </div>
)

const fetchPokemon = (
  pokemonName: string,
): Z.Effect<FrontendEnv, FetchError, PokemonResponse> =>
  pipe(
    Z.serviceWithEffect(FrontendEnv, ({ backendURL }) =>
      fetchAndValidate(PokemonResponse, `${backendURL}/pokemon/${pokemonName}`),
    ),
  )

const Showgrid: React.FC = () => (
  <div className={overlayGridContainer}>
    <div className={showGrid}>
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
      <div className={overlayGridItem} />
    </div>
  </div>
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
    <>
      <Showgrid />
      <div className={gridContainerDelimiter}>
        <div className={gridContainer}>
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
      </div>
    </>
  )
}

export default Pokemon
