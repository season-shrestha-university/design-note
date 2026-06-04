export const ARTICLE_CATEGORIES = [
  {
    slug: "user-research",
    icon: "/icons/categories/user-research-icon.svg",
  },
  {
    slug: "user-experience",
    icon: "/icons/categories/user-experience-icon.svg",
  },
  {
    slug: "user-interface",
    icon: "/icons/categories/user-interface-icon.svg",
  },
  {
    slug: "interaction-design",
    icon: "/icons/categories/user-interaction-icon.svg",
  },
  {
    slug: "usability-testing-interaction",
    icon: "/icons/categories/layout-icon.svg",
  },
] as const;

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  ARTICLE_CATEGORIES.map(({ slug, icon }) => [slug, icon]),
);

export const formatCategoryLabel = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const deriveCategory = (id: string) => id.split("/")[0];
