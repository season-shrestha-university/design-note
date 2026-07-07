export const SITE = {
  name: "Design Note",
  /** Short brand tagline appended to page titles. */
  titleSuffix: "Design Note",
  description:
    "A UI design reference system that explains everyday interface patterns and why they work — typography, grids, visual hierarchy, interactions, and core design principles.",
  /** Default social share image, relative to the site root. Optional. */
  defaultOgImage: undefined as string | undefined,
  locale: "en_US",
  lang: "en",
  /** Site X handle, e.g. "@designnote". Meta tags still use the twitter:* namespace. */
  x: undefined as string | undefined,
} as const;

export type SeoType = "website" | "article";
export type JsonLd = Record<string, unknown>;

export interface SeoProps {
  /** Page title without the brand suffix. */
  title?: string;
  description?: string;
  /** Path or absolute URL to the social share image. */
  image?: string;
  /** og:type — "website" for listing pages, "article" for notes. */
  type?: SeoType;
  canonical?: string | URL;
  publishedTime?: Date;
  modifiedTime?: Date;
  section?: string;
  /** Pre-built JSON-LD structured data objects to inline. */
  jsonLd?: JsonLd[];
}

/** Builds the full <title>, appending the brand suffix unless already present. */
export const buildTitle = (title?: string) => {
  if (!title || title === SITE.titleSuffix) return SITE.name;
  return `${title} · ${SITE.titleSuffix}`;
};

/** Safe JSON-LD serialization — neutralises `</script>` breakouts in HTML. */
export const serializeJsonLd = (schema: JsonLd) =>
  JSON.stringify(schema).replace(/</g, "\\u003c");

/** Resolves a possibly-relative path to an absolute URL against `site`. */
export const absoluteUrl = (
  path: string | URL | undefined,
  site: URL | undefined,
) => {
  if (!path) return undefined;
  if (path instanceof URL) return path.toString();
  if (/^https?:\/\//.test(path)) return path;
  if (!site) return undefined;
  return new URL(path, site).toString();
};

interface WebSiteSchemaInput {
  site: URL | undefined;
}

export const websiteSchema = ({ site }: WebSiteSchemaInput): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  description: SITE.description,
  url: site?.toString(),
});

interface ArticleSchemaInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
  section?: string;
}

export const articleSchema = ({
  title,
  description,
  url,
  image,
  publishedTime,
  modifiedTime,
  author,
  section,
}: ArticleSchemaInput): JsonLd => {
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
    },
  };
  if (image) schema.image = image;
  if (section) schema.articleSection = section;
  if (publishedTime) schema.datePublished = publishedTime.toISOString();
  if (modifiedTime) schema.dateModified = modifiedTime.toISOString();
  else if (publishedTime) schema.dateModified = publishedTime.toISOString();
  if (author) schema.author = { "@type": "Person", name: author };
  return schema;
};

interface BreadcrumbInput {
  items: { name: string; url: string }[];
}

export const breadcrumbSchema = ({ items }: BreadcrumbInput): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
