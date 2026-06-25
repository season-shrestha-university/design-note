import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL?.replace(/^["']|["']$/g, '');
const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN?.replace(/^["']|["']$/g, '');

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    })
  : null;
