// ProductSEO.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Product from "./Product";
import api from "../connect_to_api/api";
import { IProduct } from "../connect_to_api/product.interface";

const ProductSEO = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);

  useEffect(() => {
    if (productId) {
      api
        .get(`/products/${productId}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error("Erreur SEO produit :", err));
    }
  }, [productId]);

  return (
    <>
      {/* SEO */}
      <Helmet>
        <link
          rel="canonical"
          href={`https://eboutique-reconcil-beauty-afro.vercel.app${window.location.pathname}`}
        />
        <title>
          {product ? `${product.name} - Achetez en ligne` : "Produit"} -
          Reconcil' Afro Beauty
        </title>
        <meta
          name="description"
          content={
            product
              ? product.description.slice(0, 160)
              : "Page produit de notre boutique"
          }
        />
        {product && product.imageUrl && (
          <meta property="og:image" content={product.imageUrl} />
        )}
        {product && product.price && (
          <meta
            property="product:price:amount"
            content={String(product.price)}
          />
        )}
      </Helmet>

      {/* Composant existant */}
      <Product />
    </>
  );
};

export default ProductSEO;
