// ProductSEO.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Product from "./Product";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";

import { extractIdFromSlug } from "../utils/urlUtils";

const ProductSEO = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    if (slug) {
      const id = extractIdFromSlug(slug);
      api
        .get(`/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Erreur SEO produit :", err));
    }
  }, [slug]);

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.imageUrl || "https://eboutique-reconcil-beauty-afro.vercel.app/bannerAlph.png",
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Reconcil' Afro Beauty"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://eboutique-reconcil-beauty-afro.vercel.app${window.location.pathname}`,
      "priceCurrency": "EUR",
      "price": product.price,
      "availability": Number(product.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  return (
    <>
      {/* SEO */}
      <Helmet>
        <link
          rel="canonical"
          href={`https://eboutique-reconcil-beauty-afro.vercel.app${window.location.pathname}`}
        />
        <title>
          {product ? `${product.name} | Reconcil' Afro Beauty` : "Produit | Reconcil' Afro Beauty"}
        </title>
        <meta
          name="description"
          content={
            (product && typeof product === 'object' && product.description)
              ? `${product.name} - ${String(product.description).slice(0, 150)}... Découvrez nos soins naturels pour cheveux afro.`
              : "Découvrez notre produit sur Reconcil' Afro Beauty, spécialiste des soins capillaires naturels."
          }
        />
        {product && product.imageUrl && (
          <meta property="og:image" content={product.imageUrl} />
        )}
        {product && product.name && (
          <meta property="og:title" content={`${product.name} | Reconcil' Afro Beauty`} />
        )}
        {product && product.price && (
          <meta
            property="product:price:amount"
            content={String(product.price)}
          />
        )}
        {jsonLd && (
          <script type="application/ld+json">
            {JSON.stringify(jsonLd)}
          </script>
        )}
      </Helmet>

      {/* Composant existant */}
      <Product />
    </>
  );
};

export default ProductSEO;
