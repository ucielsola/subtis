import { z } from 'zod'
import { Redis } from '@upstash/redis'

// core
function getRedisInstance() {
  const [url, token] = [Bun.env.UPSTASH_REDIS_REST_URL, Bun.env.UPSTASH_REDIS_REST_TOKEN]
  const supabaseEnvironmentVariables = { url, token }

  const schema = z.object({ url: z.string(), token: z.string() })
  const redisConfig = schema.parse(supabaseEnvironmentVariables)

  return new Redis(redisConfig)
}

// constants
export const redis = getRedisInstance()
