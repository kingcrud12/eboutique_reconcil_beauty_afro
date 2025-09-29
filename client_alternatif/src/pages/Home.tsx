import React from "react";
import Hero from "../components/Hero";
import FeaturedProducts from "../components/FeaturedProducts";
import About from "../components/About";
import Newsletter from "../components/Newsletter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <FeaturedProducts />
      <About />
      <Newsletter />
    </div>
  );
}
