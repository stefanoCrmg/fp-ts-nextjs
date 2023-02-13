import * as Context from '@effect/data/Context'

export type FrontendEnv = { backendURL: URL; nextEdgeFunctionURL: URL }
export const FrontendEnv = Context.Tag<FrontendEnv>()

export const FrontendService: FrontendEnv = {
  backendURL: new URL('https://pokeapi.co/api/v2'),
  nextEdgeFunctionURL: new URL('http://localhost:3000/api'),
}
