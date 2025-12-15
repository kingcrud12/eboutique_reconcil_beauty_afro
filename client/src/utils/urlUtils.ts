export const createProductSlug = (id: number | string, name: string): string => {
    if (!name) return `${id}`;
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    return `${id}-${slug}`;
};

export const extractIdFromSlug = (slug: string): string => {
    const match = slug.match(/^(\d+)/);
    return match ? match[1] : slug;
};
