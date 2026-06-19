import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

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

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY environment variable is not set. Skipping search index embedding generation.');
  const outputPath = path.join(process.cwd(), 'src/data/search-index.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  if (!fs.existsSync(outputPath)) {
    fs.writeFileSync(outputPath, JSON.stringify([]));
  }
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });

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
      });
      
      const embedding = response.embeddings?.[0]?.values;
      if (!embedding) {
        throw new Error("No embedding values returned from API");
      }

      searchIndex.push({
        id,
        title,
        excerpt,
        slug: `/articles/${id}/`,
        embedding,
      });
    } catch (e) {
      console.error(`Failed to generate embedding for ${title}:`, e);
    }
  }
  
  const outputPath = path.join(process.cwd(), 'src/data/search-index.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));
  console.log(`Successfully generated search index at ${outputPath}`);
}

run().catch(console.error);
