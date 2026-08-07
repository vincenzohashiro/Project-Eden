import { jwtVerify } from 'jose'
import { config } from '../config.js'

const secret = new TextEncoder().encode(config.SUPABASE_JWT_SECRET)

export interface VerifiedUser {
  id: string
  email: string | null
}

export class InvalidTokenError extends Error {}

export async function verifyAccessToken(token: string): Promise<VerifiedUser> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    if (typeof payload.sub !== 'string') throw new InvalidTokenError('missing sub claim')
    return { id: payload.sub, email: typeof payload.email === 'string' ? payload.email : null }
  } catch (err) {
    if (err instanceof InvalidTokenError) throw err
    throw new InvalidTokenError('token verification failed')
  }
}
