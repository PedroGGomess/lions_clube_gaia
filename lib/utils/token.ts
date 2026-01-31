/**
 * Generate a secure random token
 * @param length - Length of the token (default: 8)
 * @returns A random alphanumeric token
 */
export function generateToken(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = ''
  
  // Use crypto.getRandomValues for secure random generation
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    token += chars[randomValues[i] % chars.length]
  }
  
  return token
}

/**
 * Generate multiple unique tokens
 * @param count - Number of tokens to generate
 * @param length - Length of each token
 * @returns Array of unique tokens
 */
export function generateTokens(count: number, length: number = 8): string[] {
  const tokens = new Set<string>()
  
  while (tokens.size < count) {
    tokens.add(generateToken(length))
  }
  
  return Array.from(tokens)
}
