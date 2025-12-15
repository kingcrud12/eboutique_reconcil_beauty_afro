// src/pages/ProductsSEO.tsx
import React from "react";
import { Helmet } from "react-helmet";
import Products from "./Products";

const ProductsSEO = () => {
  return (
    <>
      <Helmet>
        <link
          rel="canonical"
          href={`https://eboutique-reconcil-beauty-afro.vercel.app${window.location.pathname}`}
        />
        <title>
          Produits Afro Beauté - Huile de Carthame, Chebe & Soins Capillaires | Reconcil' Afro Beauty
        </title>
        <meta
          name="description"
          content="Achetez nos huiles de carthame et chebe pour cheveux afro. Soins naturels, hydratation et croissance. Découvrez toute la gamme Afro Beauté."
        />
        <meta
          property="og:title"
          content="Produits Afro Beauté - Huile de Carthame & Chebe"
        />
        <meta
          property="og:description"
          content="Découvrez notre sélection de produits capillaires et corporels de qualité pour cheveux et corps. Achetez facilement en ligne !"
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <Products />
    </>
  );
};

export default ProductsSEO;
