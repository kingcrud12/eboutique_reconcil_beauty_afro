import React from "react";

const About = () => {
  return (
    <div className="mt-[90px] px-6 py-16 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-12">
        {/* Image */}
        <div className="flex-shrink-0 w-full md:w-2/5">
          <img
            src="/Black_hair.gif"
            alt="Fondatrice Arc en Ciel Mawema"
            className="rounded-xl shadow-lg w-full h-auto object-cover -mt-20"
          />
        </div>

        {/* Texte */}
        <div className="md:w-3/5 lg:mt-[-90px]">
          <h1 className="text-4xl font-bold mb-6">À propos de nous</h1>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Paulette Siewe Emassi, fondatrice de{" "}
            <strong>Arcenciel Mawema</strong>, est une femme passionnée par la
            beauté naturelle et le bien-être des femmes afrodescendantes. Son
            aventure commence dans un petit salon familial, motivée par l’envie
            de proposer des produits capillaires et corporels adaptés, naturels
            et inspirants.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            Au fil des années, elle bâtit un univers coloré, engagé et humain,
            devenu aujourd’hui une véritable boutique de référence pour les
            soins afro. Arc en Ciel Mawema est bien plus qu’une marque : c’est
            un hommage à la diversité, une maison de beauté où chaque femme peut
            se sentir vue, écoutée et valorisée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
