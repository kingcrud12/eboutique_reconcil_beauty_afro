import React from "react";
import Hero from "../components/Hero";
import { Helmet } from "react-helmet";
import Testimony from "../components/Testimony";
import Product from "../components/Product";
import About from "./About";

function home() {
  return (
    <div>
      <Helmet>
        <title>Afro Beauté - Huile de Carthame, Chebe & Soins Naturels | Reconcil' Afro Beauty</title>
        <meta
          name="description"
          content="Boutique Afro Beauté spécialisée. Découvrez nos huiles de carthame, huile de chebe et soins naturels pour cheveux et corps. Livraison rapide."
        />
        <link rel="canonical" href="https://eboutique-reconcil-beauty-afro.vercel.app/" />
      </Helmet>
      <Hero />
      <Product />
      <About />
      <Testimony />
    </div>
  );
}

export default home;
