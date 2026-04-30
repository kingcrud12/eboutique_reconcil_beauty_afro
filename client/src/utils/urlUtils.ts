export const createSlug = (text: string | undefined): string => {
    if (!text) return "categorie";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
};

export const createProductSlug = (id: number | string, name: string): string => {
    if (!name) return `${id}`;
    const slug = createSlug(name);
    return `${slug}-${id}`;
};

export const extractIdFromSlug = (slug: string): string => {
    const match = slug.match(/-(\d+)$/);
    if (match) return match[1];
    
    // Fallback pour les anciennes URL commençant par l'ID (ex: 1-nom)
    const oldMatch = slug.match(/^(\d+)/);
    return oldMatch ? oldMatch[1] : slug;
};
