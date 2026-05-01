const fs = require('fs');
const https = require('https');
const path = require('path');

const SITE_URL = 'https://reconcil-afro-beauty.com';
const API_URL = 'https://eboutique-reconcil-beauty-afro.onrender.com/reconcil/api/shop/products';

const createSlug = (text) => {
    if (!text) return "categorie";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
};

const createProductSlug = (id, name) => {
    if (!name) return `${id}`;
    const slug = createSlug(name);
    return `${slug}-${id}`;
};

const staticRoutes = [
    '/',
    '/products',
    '/products/soins-cheveux',
    '/products/soins-corps',
    '/about',
    '/contact',
    '/services',
    '/login',
    '/register'
];

async function fetchProducts() {
    return new Promise((resolve, reject) => {
        https.get(API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const products = JSON.parse(data);
                    resolve(products);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function generateSitemap() {
    try {
        console.log('Fetching products for sitemap...');
        const products = await fetchProducts();
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Add static routes
        for (const route of staticRoutes) {
            xml += `  <url>\n`;
            xml += `    <loc>${SITE_URL}${route}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        }

        // Add dynamic product routes
        if (Array.isArray(products)) {
            for (const product of products) {
                const categorySlug = createSlug(product.category);
                const productSlug = createProductSlug(product.id, product.name);
                xml += `  <url>\n`;
                xml += `    <loc>${SITE_URL}/product/${categorySlug}/${productSlug}</loc>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.9</priority>\n`;
                xml += `  </url>\n`;
            }
        }

        xml += `</urlset>`;

        const publicPath = path.join(__dirname, '../public/sitemap.xml');
        fs.writeFileSync(publicPath, xml, 'utf8');
        console.log(`Sitemap successfully generated at ${publicPath}`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        // Fallback to static only if API fails
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        for (const route of staticRoutes) {
            xml += `  <url><loc>${SITE_URL}${route}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        }
        xml += `</urlset>`;
        fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml, 'utf8');
        console.log('Generated fallback static sitemap due to API error.');
    }
}

generateSitemap();
