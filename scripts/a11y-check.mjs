import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import axe from "axe-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATE_DIRS = [
  path.join(ROOT, "dist", "client"),
  path.join(ROOT, ".vercel", "output", "static"),
  path.join(ROOT, "dist"),
];

/** Rules that need a real layout engine — unreliable under jsdom. */
const DISABLED_RULES = {
  "color-contrast": { enabled: false },
  "color-contrast-enhanced": { enabled: false },
  "link-in-text-block": { enabled: false },
  "target-size": { enabled: false },
};

function findHtmlRoot() {
  for (const dir of CANDIDATE_DIRS) {
    if (fs.existsSync(path.join(dir, "index.html"))) {
      return dir;
    }
  }
  return null;
}

function collectHtmlFiles(dir) {
  /** @type {string[]} */
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "pagefind" || entry.name === "_astro") continue;
      files.push(...collectHtmlFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

/**
 * @param {string} filePath
 * @param {string} htmlRoot
 */
async function scanFile(filePath, htmlRoot) {
  const html = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(html, {
    url: `https://design-note.local/${path.relative(htmlRoot, filePath)}`,
    pretendToBeVisual: true,
  });

  const { window } = dom;
  // axe expects browser globals on the active realm
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.Node = window.Node;
  globalThis.Element = window.Element;
  globalThis.Document = window.Document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.NodeList = window.NodeList;

  const results = await axe.run(window.document.documentElement, {
    rules: DISABLED_RULES,
    resultTypes: ["violations"],
  });

  dom.window.close();
  return results.violations;
}

function printViolations(relativePath, violations) {
  console.error(`\n✖ ${relativePath}`);
  for (const violation of violations) {
    console.error(
      `  [${violation.impact ?? "unknown"}] ${violation.id}: ${violation.help}`,
    );
    console.error(`  ${violation.helpUrl}`);
    for (const node of violation.nodes.slice(0, 5)) {
      console.error(`    - ${node.target.join(" > ")}`);
      console.error(`      ${node.html.slice(0, 160)}`);
    }
    if (violation.nodes.length > 5) {
      console.error(`    …and ${violation.nodes.length - 5} more nodes`);
    }
  }
}

async function main() {
  const htmlRoot = findHtmlRoot();
  if (!htmlRoot) {
    console.error(
      "No built HTML found. Run `pnpm exec astro build` before the a11y check.",
    );
    process.exit(1);
  }

  const files = collectHtmlFiles(htmlRoot);
  if (files.length === 0) {
    console.error(`No HTML pages found under ${path.relative(ROOT, htmlRoot)}`);
    process.exit(1);
  }

  console.log(
    `Checking ${files.length} page(s) in ${path.relative(ROOT, htmlRoot)} with axe-core…`,
  );

  let failedPages = 0;
  let totalViolations = 0;

  for (const filePath of files) {
    const relativePath = path.relative(ROOT, filePath);
    try {
      const violations = await scanFile(filePath, htmlRoot);
      if (violations.length === 0) {
        console.log(`✓ ${relativePath}`);
        continue;
      }
      failedPages += 1;
      totalViolations += violations.length;
      printViolations(relativePath, violations);
    } catch (error) {
      failedPages += 1;
      console.error(`\n✖ ${relativePath}`);
      console.error(
        `  Failed to scan: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  if (failedPages > 0) {
    console.error(
      `\nAccessibility check failed: ${totalViolations} violation(s) across ${failedPages} page(s).`,
    );
    process.exit(1);
  }

  console.log(`\nAccessibility check passed (${files.length} page(s)).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
