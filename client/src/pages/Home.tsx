import React from "react";
import Hero from "../components/Hero";
import Testimony from "../components/Testimony";
import Product from "../components/Product";
import About from "./About";

function home() {
  return (
    <div>
      <Hero />
      <Product />
      <About />
      <Testimony />
    </div>
  );
}

export default home;
