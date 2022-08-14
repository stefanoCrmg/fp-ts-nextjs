import { url } from 'fp-ts-std'
import * as E from 'fp-ts/Either'
import { identity, pipe } from 'fp-ts/function'
import * as t from 'io-ts'

export interface URLFromStringC extends t.Type<URL, string, unknown> {}

export const URLFromString: URLFromStringC = new t.Type<URL, string, unknown>(
  'URLFromString',
  (u): u is URL => u instanceof URL,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      E.chainW(url.parse(identity)),
      E.orElse(() => t.failure(u, c)),
    ),
  String,
)

export const URLFromEnvVar = (name: string): URL =>
  pipe(
    URLFromString.decode(process.env[name]),
    E.getOrElseW(() => {
      throw new Error(`\`${name}\` is not a valid URL`)
    }),
  )

type ProjectEnv = {
  pokemonAPI: URL
}

const ProjectEnv: ProjectEnv = {
  pokemonAPI: URLFromEnvVar('POKEMON_API'),
}

export { ProjectEnv }
