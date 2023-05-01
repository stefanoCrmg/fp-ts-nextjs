import type { NextApiRequest, NextApiResponse } from 'next'
import * as Effect from '@effect/io/Effect'
import * as Duration from '@effect/data/Duration'
import { pipe } from '@effect/data/Function'

const someMillis = Duration.millis(3000)
const succ = (res: NextApiResponse): Effect.Effect<never, never, void> =>
  Effect.async(() => res.status(200).json({ name: 'hello!' }))

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  pipe(succ(res), Effect.delay(someMillis), Effect.runPromise)
}
