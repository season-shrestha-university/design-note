export const prerender = false;

import type { APIRoute } from 'astro';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../db/supabase';

const apiKey = import.meta.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify([]), { status: 200 });
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

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Search failed' }), { status: 500 });
  }
};
