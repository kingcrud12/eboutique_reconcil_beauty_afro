import React from 'react';

const About = () => {
  return (
    <div className="mt-[90px] px-6 py-16 bg-white text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* Image */}
        <div className="flex-shrink-0 w-full md:w-1/2">
          <img
            src="/Black_hair.gif"
            alt="Fondatrice Arc en Ciel Mawema"
            className="rounded-xl shadow-lg w-[500px] h-auto object-cover mt-[-80px]"
          />
        </div>

        {/* Texte */}
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">À propos de nous</h1>
          <p className="text-lg leading-relaxed text-gray-700">
            Paulette Siewe Emassi, fondatrice de <strong>Arc en Ciel Mawema</strong>, est une femme passionnée par la beauté naturelle et le bien-être des femmes afrodescendantes.
            Son aventure commence dans un petit salon familial, motivée par l’envie de proposer des produits capillaires et corporels adaptés, naturels et inspirants.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-700">
            Au fil des années, elle bâtit un univers coloré, engagé et humain, devenu aujourd’hui une véritable boutique de référence pour les soins afro.
            Arc en Ciel Mawema est bien plus qu’une marque : c’est un hommage à la diversité, une maison de beauté où chaque femme peut se sentir vue, écoutée et valorisée.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
