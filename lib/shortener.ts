import { prisma } from './prisma'

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SHORT_CODE_LENGTH = 6

/**
 * Generate a random short code
 */
export function generateShortCode(): string {
  let result = ''
  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
  }
  return result
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Generate a unique short code
 */
export async function generateUniqueShortCode(): Promise<string> {
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode()
    const existing = await prisma.link.findUnique({
      where: { shortCode },
    })

    if (!existing) {
      return shortCode
    }

    attempts++
  }

  throw new Error('Failed to generate unique short code after multiple attempts')
}

/**
 * Check if a custom alias is available
 */
export async function isAliasAvailable(alias: string): Promise<boolean> {
  if (!alias || alias.length < 3) {
    return false
  }

  const existing = await prisma.link.findUnique({
    where: { shortCode: alias },
  })

  return !existing
}

/**
 * Normalize URL (add https:// if no protocol)
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

