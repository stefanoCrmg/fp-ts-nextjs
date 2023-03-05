import * as Context from '@effect/data/Context'
import * as Config from '@effect/io/Config'
import * as configProvider from '@effect/io/Config/Provider'
import * as Layer from '@effect/io/Layer'
import * as Effect from '@effect/io/Effect'
import { pipe, flow } from '@effect/data/Function'

export const FrontendEnv = Context.Tag<FrontendEnv>()
export interface FrontendEnv {
  readonly backendURL: URL
  readonly nextEdgeFunctionURL: URL
}

export const ConfigUrl = flow(
  Config.string,
  Config.mapAttempt((_) => new URL(_)),
)

const FrontendEnvMap = new Map([
  ['NEXT_PUBLIC_BACKEND_URL', process.env.NEXT_PUBLIC_BACKEND_URL || ''],
  [
    'NEXT_PUBLIC_EDGE_FUNCTION_URL',
    process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL || '',
  ],
])

const MapProvider = configProvider.fromMap(FrontendEnvMap)

export const FrontendEnvConfig: Config.Config<FrontendEnv> = Config.all({
  backendURL: ConfigUrl('NEXT_PUBLIC_BACKEND_URL'),
  nextEdgeFunctionURL: ConfigUrl('NEXT_PUBLIC_EDGE_FUNCTION_URL'),
})

const pullEnvFromMap = pipe(
  Effect.config(FrontendEnvConfig),
  Effect.provideLayer(Effect.setConfigProvider(MapProvider)),
)

export const FrontendLive = pipe(Layer.effect(FrontendEnv, pullEnvFromMap))
