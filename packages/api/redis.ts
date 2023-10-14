import { z } from 'zod';
import { Redis } from '@upstash/redis';

// utils
function getRedisInstance() {
  const [url, token] = [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN];
  const supabaseEnvironmentVariables = { url, token };

  const schema = z.object({ url: z.string(), token: z.string() });
  const redisConfig = schema.parse(supabaseEnvironmentVariables);

  return new Redis(redisConfig);
}

// constants
export const redis = getRedisInstance();
