// node scripts/generate-sitemap.js
const fs = require('fs');
const routes = [
  '/', '/products', '/contact', '/about'
  // ajoute ici dynamiquement tes produits si tu as la liste ou génère depuis l'API
];

const host = 'https://eboutique-reconcil-beauty-afro.vercel.app';
const urls = routes.map(r => `
  <url>
    <loc>${host}${r}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

fs.writeFileSync('build/sitemap.xml', xml);
console.log('sitemap.xml generated in build/');
