import { z } from 'zod'
import { describe, expect, it } from 'bun:test'

// internals
import * as schemas from './schemas'

describe('DB | schemas', () => {
  it('checks that all schemas are zod instances', () => {
    Object.values(schemas).forEach((schema) => {
      expect(schema).toBeInstanceOf(z.ZodSchema)
    })
  })

  it('checks that all schemas are valid', () => {
    Object.values(schemas).forEach((schema) => {
      expect(() => schema.parse({})).not.toThrow()
    })
  })
})
