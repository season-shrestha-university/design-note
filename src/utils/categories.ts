export const formatCategoryLabel = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const deriveCategory = (id: string) => id.split("/")[0];
