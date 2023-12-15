import { z } from 'zod'
import { Redis } from '@upstash/redis'

const redisConfigSchema = z.object({ url: z.string(), token: z.string() })

// core
function getRedisInstance(): Redis {
  const [url, token] = [Bun.env.UPSTASH_REDIS_REST_URL, Bun.env.UPSTASH_REDIS_REST_TOKEN]
  const supabaseEnvironmentVariables = { url, token }

  const redisConfig = redisConfigSchema.parse(supabaseEnvironmentVariables)

  return new Redis(redisConfig)
}

// constants
export const redis = getRedisInstance()

// utils
export async function cleanRedis(): Promise<'OK'> {
  return redis.flushall()
}
