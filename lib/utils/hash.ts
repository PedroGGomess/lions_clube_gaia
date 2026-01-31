/**
 * Hash a token using SHA-256
 * @param token - The token to hash
 * @param salt - Optional salt (uses a default app salt if not provided)
 * @returns Hashed token as hex string
 */
export async function hashToken(token: string, salt: string = 'voting-app-salt-2024'): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Verify a token against a hash
 * @param token - The token to verify
 * @param hash - The hash to compare against
 * @param salt - Optional salt
 * @returns True if token matches hash
 */
export async function verifyToken(token: string, hash: string, salt?: string): Promise<boolean> {
  const tokenHash = await hashToken(token, salt)
  return tokenHash === hash
}
