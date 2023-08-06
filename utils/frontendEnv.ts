import * as Context from 'effect/Context'
import * as Config from 'effect/Config'
import * as configProvider from 'effect/ConfigProvider'
import * as Layer from 'effect/Layer'
import * as Effect from 'effect/Effect'
import { pipe } from 'effect/Function'
export interface FrontendEnv {
  readonly backendURL: URL
  readonly nextEdgeFunctionURL: string
}
export const FrontendEnv = Context.Tag<FrontendEnv>()

export const ConfigUrl = (_: string | undefined) => pipe(
  Config.string(_),
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
  nextEdgeFunctionURL: Config.string('NEXT_PUBLIC_EDGE_FUNCTION_URL'),
})

const pullEnvFromMap = pipe(
  Effect.config(FrontendEnvConfig),
  Effect.provideLayer(Effect.setConfigProvider(MapProvider)),
)

export const FrontendLive = pipe(Layer.effect(FrontendEnv, pullEnvFromMap))
