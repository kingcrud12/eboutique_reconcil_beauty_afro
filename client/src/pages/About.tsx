import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <section className="bg-cream-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-14 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Image */}
          <div className="flex-shrink-0 w-full md:w-2/5">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="/Black_hair.gif"
                alt="Fondatrice Arc en Ciel Mawema"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="md:w-3/5">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-sage-600 mb-4">
              Notre Histoire
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif text-gray-800 mb-6 leading-tight">
              À propos de nous
            </h2>

            <p className="text-base leading-relaxed text-gray-600 mb-4">
              Reconcil' Afro Beauty By <strong className="text-gray-800">Arcenciel Mawema</strong>, est un
              repère qui encourage et aide les afro et afro-descendants à
              réconcilier avec leur identité capillaire et beauté. Chez Arcenciel
              Manwema, nous croyons que vos cheveux ne sont pas seulement une
              texture, mais un héritage, une force et une fierté.
            </p>

            <p className="text-base leading-relaxed text-gray-600 mb-8">
              <strong className="text-gray-800">Notre engagement</strong> — Arcenciel Manwema est bien plus qu'une simple boutique en ligne.
              C'est un espace dédié à l'éveil, au soin et à la valorisation des
              cheveux crépus, bouclés et frisés.
            </p>

            <Link
              to="/aboutUs"
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-sage-600 text-sage-600 font-medium rounded-lg hover:bg-sage-600 hover:text-white transition-all duration-300 text-sm group"
            >
              En savoir plus
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
