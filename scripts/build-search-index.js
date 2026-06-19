import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Load local .env file if it exists (for local development)
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const apiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY environment variable is not set. Skipping search index embedding generation.');
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY environment variable is not set. Skipping database sync.');
}

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (filePath.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

function parseMDX(content) {
  const parts = content.split('---');
  if (parts.length < 3) return null;
  const frontmatterText = parts[1];
  const body = parts.slice(2).join('---').trim();
  
  const data = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const val = line.substring(colonIndex + 1).trim();
      data[key] = val.replace(/^["']|["']$/g, '');
    }
  });
  
  return { data, body };
}

async function run() {
  const articlesDir = path.join(process.cwd(), 'src/content/articles');
  if (!fs.existsSync(articlesDir)) {
    console.error('Articles directory not found.');
    process.exit(1);
  }
  
  const files = getFiles(articlesDir);
  const searchIndex = [];
  
  for (const file of files) {
    const relativePath = path.relative(articlesDir, file);
    const id = relativePath.replace(/\.mdx$/, '');
    const content = fs.readFileSync(file, 'utf-8');
    const parsed = parseMDX(content);
    if (!parsed) continue;
    
    const { data, body } = parsed;
    const title = data.title || id;
    const excerpt = data.excerpt || '';
    const textToEmbed = `${title}\n${excerpt}\n${body}`;
    
    console.log(`Generating embedding for: ${title}`);
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: textToEmbed,
        config: {
          outputDimensionality: 768,
        }
      });
      
      const embedding = response.embeddings?.[0]?.values;
      if (!embedding) {
        throw new Error("No embedding values returned from API");
      }

      const slug = `/articles/${id}/`;

      searchIndex.push({
        id,
        title,
        excerpt,
        slug,
        embedding,
      });

      if (supabase) {
        console.log(`Syncing ${title} to Supabase...`);
        const { error } = await supabase
          .from('articles')
          .upsert({
            slug,
            title,
            excerpt,
            embedding,
          }, { onConflict: 'slug' });

        if (error) {
          console.error(`❌ Failed to sync ${title} to Supabase:`, error.message);
        } else {
          console.log(`✅ Successfully synced ${title} to Supabase`);
        }
      }
    } catch (e) {
      console.error(`Failed to generate embedding for ${title}:`, e);
    }
  }
  
  console.log('Successfully completed building search index and syncing to Supabase!');
}

run().catch(console.error);
