export const prerender = false;

import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../db/supabase';
import { redis, ratelimit } from '../../db/redis';

const apiKey = import.meta.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GET: APIRoute = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  // Layer 1: Rate Limiting
  if (ratelimit) {
    let ip = '127.0.0.1';
    try {
      ip = context.clientAddress || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    } catch (e) {
      ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    }

    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(`search_limit_${ip}`);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        });
      }
    } catch (err) {
      console.error('Rate limiting error, falling back to bypass:', err);
    }
  }

  // Layer 2: Caching
  const normalizedQuery = query.toLowerCase().trim();
  const cacheKey = `search_cache:${normalizedQuery}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`🟢 Cache HIT for query: "${normalizedQuery}"`);
        const cachedResults = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return new Response(JSON.stringify(cachedResults), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT'
          }
        });
      }
    } catch (err) {
      console.error('Redis cache read error, falling back to live search:', err);
    }
  }

  if (!ai) {
    console.warn('GEMINI_API_KEY environment variable is not set. Cannot run AI search.');
    return new Response(JSON.stringify([]), { status: 200 });
  }

  if (!supabase) {
    console.warn('Supabase client is not configured. Cannot run database vector search.');
    return new Response(JSON.stringify([]), { status: 200 });
  }

  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: `task: search result | query: ${query}`,
      config: {
        outputDimensionality: 768,
      }
    });
    const queryEmbedding = response.embeddings?.[0]?.values;

    if (!queryEmbedding) {
      throw new Error("No embedding values returned from API");
    }

    const { data: matchedArticles, error: supabaseError } = await supabase.rpc('match_articles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (supabaseError) {
      throw supabaseError;
    }

    const results = (matchedArticles || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      score: article.similarity
    }));

    // Cache the results in Redis (24-hour expiration)
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(results), { ex: 86400 });
        console.log(`🔴 Cache MISS for query: "${normalizedQuery}" — cached for 24h`);
      } catch (err) {
        console.error('Redis cache write error:', err);
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
  }
};

