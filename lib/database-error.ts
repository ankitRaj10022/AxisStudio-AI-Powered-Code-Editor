const seenMessages = new Set<string>()

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export function logDatabaseError(context: string, error: unknown) {
  const message = `[${context}] ${getErrorMessage(error)}`

  if (seenMessages.has(message)) {
    return
  }

  seenMessages.add(message)
  console.warn(message)
}
