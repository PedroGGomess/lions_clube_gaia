import crypto from 'crypto'

export function generateCode(): string {
  // Generate a 8-character code
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateVotingToken(code: string): string {
  // Generate a unique token from the code + random salt
  const salt = crypto.randomBytes(16).toString('hex')
  return crypto.createHash('sha256').update(code + salt).digest('hex')
}
