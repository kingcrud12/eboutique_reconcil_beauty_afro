import React from "react";
import { Link } from "react-router-dom";

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
            Reconcil' Afro Beauty By <strong>Arcenciel Mawema</strong>, Est un
            repère qui encourage et aide les afro et afro-descendants à
            réconcilier avec leur identité capillaire et beauté Chez Arcenciel
            Manwema, nous croyons que vos cheveux ne sont pas seulement une
            texture, mais un héritage, une force et une fierté. Notre mission :
            vous accompagner sur le chemin de la réconciliation avec votre
            identité capillaire.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            <strong>Notre engagement</strong> <br />
            Arcenciel Manwema est bien plus qu&#39;une simple boutique en ligne.
            C’est un espace dédié à l’éveil, au soin et à la valorisation des
            cheveux crépus, bouclés et frisés. Nous vous aidons à comprendre,
            aimer et sublimer vos cheveux au naturel{" "}
            <Link to="/aboutUs">...</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
