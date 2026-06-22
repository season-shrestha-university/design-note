import fs from "fs";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Load local .env file if it exists (for local development)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
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
  console.warn(
    "⚠️ GEMINI_API_KEY environment variable is not set. Skipping search index embedding generation.",
  );
  process.exit(0);
}

const ai = new GoogleGenAI({ apiKey });
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!supabase) {
  console.warn(
    "⚠️ SUPABASE_URL or SUPABASE_KEY environment variable is not set. Skipping database sync.",
  );
}

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (filePath.endsWith(".mdx")) {
      results.push(filePath);
    }
  });
  return results;
}

function parseMDX(content) {
  const parts = content.split("---");
  if (parts.length < 3) return null;
  const frontmatterText = parts[1];
  const body = parts.slice(2).join("---").trim();

  const data = {};
  frontmatterText.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const val = line.substring(colonIndex + 1).trim();
      data[key] = val.replace(/^["']|["']$/g, "");
    }
  });

  return { data, body };
}

async function run() {
  const articlesDir = path.join(process.cwd(), "src/content/articles");
  if (!fs.existsSync(articlesDir)) {
    console.error("Articles directory not found.");
    process.exit(1);
  }

  const existingHashes = new Map();
  if (supabase) {
    console.log("Fetching existing article hashes from database...");
    const { data, error } = await supabase.from("articles").select("slug, content_hash");
    if (!error && data) {
      for (const row of data) {
        existingHashes.set(row.slug, row.content_hash);
      }
    } else if (error) {
      console.warn("Could not fetch existing hashes (does the content_hash column exist?):", error.message);
    }
  }

  const files = getFiles(articlesDir);
  const searchIndex = [];
  const currentSlugs = new Set();

  for (const file of files) {
    const relativePath = path.relative(articlesDir, file);
    const id = relativePath.replace(/\.mdx$/, "");
    const content = fs.readFileSync(file, "utf-8");
    const parsed = parseMDX(content);
    if (!parsed) continue;

    const { data, body } = parsed;
    const title = data.title || id;
    const excerpt = data.excerpt || "";
    const textToEmbed = `title: ${title} | text: ${title}\n${excerpt}\n${body}`;
    const slug = `/articles/${id}/`;
    currentSlugs.add(slug);

    const hash = crypto.createHash("sha256").update(textToEmbed).digest("hex");

    if (supabase && existingHashes.get(slug) === hash) {
      console.log(`⏩ Skipped ${title} (No changes detected)`);
      continue;
    }

    console.log(`Generating embedding for: ${title}`);
    try {
      const response = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: textToEmbed,
        config: {
          outputDimensionality: 768,
        },
      });

      const embedding = response.embeddings?.[0]?.values;
      if (!embedding) {
        throw new Error("No embedding values returned from API");
      }

      searchIndex.push({
        id,
        title,
        excerpt,
        slug,
        embedding,
        content_hash: hash,
      });

      if (supabase) {
        console.log(`Syncing ${title} to Supabase...`);
        const { error } = await supabase.from("articles").upsert(
          {
            slug,
            title,
            excerpt,
            embedding,
            content_hash: hash,
          },
          { onConflict: "slug" },
        );

        if (error) {
          console.error(
            `❌ Failed to sync ${title} to Supabase:`,
            error.message,
          );
        } else {
          console.log(`✅ Successfully synced ${title} to Supabase`);
        }
      }
    } catch (e) {
      console.error(`Failed to generate embedding for ${title}:`, e);
    }
  }

  if (supabase) {
    const orphanedSlugs = [...existingHashes.keys()].filter(
      (slug) => !currentSlugs.has(slug),
    );

    if (orphanedSlugs.length > 0) {
      console.log(
        `Removing ${orphanedSlugs.length} orphaned article(s) from Supabase...`,
      );
      const { error } = await supabase
        .from("articles")
        .delete()
        .in("slug", orphanedSlugs);

      if (error) {
        console.error(
          "❌ Failed to remove orphaned articles from Supabase:",
          error.message,
        );
      } else {
        for (const slug of orphanedSlugs) {
          console.log(`🗑️ Deleted orphaned article: ${slug}`);
        }
      }
    }
  }

  console.log(
    "Successfully completed building search index and syncing to Supabase!",
  );
}

run().catch(console.error);
