import { Redis } from '@upstash/redis'
import { describe, expect, it } from 'bun:test'

// internals
import { redis } from '.'

describe('API | Redis', () => {
  it('returns a redis instance', () => {
    expect(redis).toBeInstanceOf(Redis)
  })
})
