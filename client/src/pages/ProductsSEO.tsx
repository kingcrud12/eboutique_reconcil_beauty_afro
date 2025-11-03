// src/pages/ProductsSEO.tsx
import React from "react";
import { Helmet } from "react-helmet";
import Products from "./Products";

const ProductsSEO = () => {
  return (
    <>
      <Helmet>
        <title>
          Nos produits capillaires et corporels - Reconcil' Afro Beauty
        </title>
        <meta
          name="description"
          content="Découvrez notre sélection de produits capillaires et corporels de qualité pour cheveux et corps. Achetez facilement en ligne !"
        />
        <meta
          property="og:title"
          content="Nos produits capillaires et corporels"
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
