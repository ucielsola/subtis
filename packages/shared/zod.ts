import { z } from 'zod'

export function getZodError(error: Error): string | null {
  const result = z.instanceof(z.ZodError).safeParse(error)

  if (result.success) {
    return result.data.errors[0].message
  }

  return null
}
