import { z } from 'zod'
import { Redis } from '@upstash/redis';

export function getRedisInstance() {
  const [url, token] = [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN];
  const supabaseEnvVars = { url, token };

  const schema = z.object({ url: z.string(), token: z.string() });
  const redisConfig =  schema.parse(supabaseEnvVars);

  return new Redis(redisConfig);
}
