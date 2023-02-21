import * as Context from '@effect/data/Context'
import * as configProvider from '@effect/io/Config/Provider'
import * as Config from '@effect/io/Config'
import * as Layer from '@effect/io/Layer'
import * as Effect from '@effect/io/Effect'
import { flow } from '@fp-ts/core/function'

export type FrontendEnv = { backendURL: URL }

export const url = flow(
  Config.string,
  Config.mapAttempt((_) => new URL(_)),
)

const frontEndSourceMap = new Map([
  ['backendURL', `${process.env.NEXT_PUBLIC_BACKEND_URL}`],
])

export const frontEndSource = configProvider.fromMap(frontEndSourceMap)
export const envSource = configProvider.fromEnv()
export const FrontendConfig: Config.Config<FrontendEnv> = Config.struct({
  backendURL: url('NEXT_PUBLIC_BACKEND_URL'),
})

export const FrontendEnv = Context.Tag<FrontendEnv>()
export const FrontendService: FrontendEnv = {
  backendURL: new URL('https://pokeapi.co/api/v2'),
}

export const FrontendLive = Layer.effect(
  FrontendEnv,
  Effect.config(FrontendConfig),
)
