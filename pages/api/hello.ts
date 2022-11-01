import { formatValidationErrors } from 'io-ts-reporters'
import { fakePostBody } from './../index'
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { JsonFromString } from 'io-ts-types'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return pipe(
    JsonFromString.pipe(fakePostBody).decode(_req.body),
    E.matchW(
      (e) => res.status(404).json({ msg: formatValidationErrors(e).join('') }),
      ({ name }) => res.status(200).json({ name }),
    ),
  )
}
