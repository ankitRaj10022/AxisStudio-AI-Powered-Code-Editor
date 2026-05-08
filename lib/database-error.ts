const seenMessages = new Set<string>()

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function getCause(error: unknown): unknown {
  if (!error || typeof error !== 'object' || !('cause' in error)) {
    return null
  }

  return (error as { cause?: unknown }).cause ?? null
}

function getErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return null
  }

  const code = (error as { code?: unknown }).code
  return code == null ? null : String(code)
}

function formatErrorChain(error: unknown): string {
  const parts: string[] = []
  let current: unknown = error
  let depth = 0

  while (current && depth < 5) {
    const message = getErrorMessage(current)
    const code = getErrorCode(current)
    const prefix = depth === 0 ? '' : `cause ${depth}: `
    const suffix = code ? ` (code: ${code})` : ''
    parts.push(`${prefix}${message}${suffix}`)

    current = getCause(current)
    depth += 1
  }

  return parts.join('\n')
}

export function logDatabaseError(context: string, error: unknown) {
  const message = `[${context}] ${formatErrorChain(error)}`

  if (seenMessages.has(message)) {
    return
  }

  seenMessages.add(message)
  console.warn(message)
}
