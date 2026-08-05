import { breadcrumbSchema, type JsonLd } from "./seo";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export const buildBreadcrumbJsonLd = (
  items: BreadcrumbItem[],
  site: URL | string | undefined,
): JsonLd =>
  breadcrumbSchema({
    items: items.map(({ label, href }) => ({
      name: label,
      url: new URL(href, site).toString(),
    })),
  });
