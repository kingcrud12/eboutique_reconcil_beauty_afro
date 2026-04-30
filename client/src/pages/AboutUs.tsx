import React from "react";

const AboutUs = () => {
  return (
    <div className="min-h-[80vh] bg-white text-gray-800 py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch gap-10 lg:gap-16">
        {/* Image */}
        <div className="w-full md:w-5/12 flex-shrink-0">
          <img
            src="/Black_hair.gif"
            alt="Fondatrice Arc en Ciel Mawema"
            className="rounded-2xl w-full h-full object-cover max-h-[600px]"
          />
        </div>

        {/* Texte */}
        <div className="w-full md:w-7/12 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-gray-900">
            À propos de nous
          </h1>
          
          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto pr-4 md:pr-6 scrollbar-thin scrollbar-thumb-sage-200 scrollbar-track-transparent" style={{ maxHeight: "500px" }}>
            <p className="text-base leading-relaxed text-gray-600 mb-6">
              Reconcil' Afro Beauty By <strong className="text-gray-800">Arcenciel Mawema</strong>, est un
              repère qui encourage et aide les afro et afro-descendants à
              réconcilier avec leur identité capillaire et beauté. Chez Arcenciel
              Manwema, nous croyons que vos cheveux ne sont pas seulement une
              texture, mais un héritage, une force et une fierté. Notre mission :
              vous accompagner sur le chemin de la réconciliation avec votre
              identité capillaire.
            </p>

            <div className="mb-6">
              <strong className="text-gray-900 block mb-2 font-serif text-xl">Notre engagement</strong>
              <p className="text-base leading-relaxed text-gray-600">
                Arcenciel Manwema est bien plus qu&#39;une simple boutique en ligne.
                C’est un espace dédié à l’éveil, au soin et à la valorisation des
                cheveux crépus, bouclés et frisés. Nous vous aidons à comprendre,
                aimer et sublimer vos cheveux au naturel.
              </p>
            </div>

            <div className="mb-6">
              <strong className="text-gray-900 block mb-3 font-serif text-xl">Nos services</strong>
              <ul className="space-y-4 text-base text-gray-600">
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <strong className="text-gray-800">Accompagnement personnalisé :</strong> Diagnostic capillaire, coaching individuel ou en groupe pour mieux connaître vos cheveux.
                </li>
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <strong className="text-gray-800">Conseils &amp; expertise :</strong> Des recommandations adaptées à votre type de cheveux, vos habitudes et vos objectifs.
                </li>
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <strong className="text-gray-800">Coiffure :</strong> Des prestations en salon ou à domicile, avec des coiffures protectrices, naturelles ou créatives.
                </li>
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <strong className="text-gray-800">Boutique en ligne :</strong> Une sélection rigoureuse de produits capillaires naturels, éthiques et adaptés aux besoins des cheveux afro.
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <strong className="text-gray-900 block mb-2 font-serif text-xl">Notre vision</strong>
              <p className="text-base leading-relaxed text-gray-600">
                Nous œuvrons pour une beauté libre, authentique et consciente. Nous
                croyons que se reconnecter à ses racines, c’est aussi se reconnecter
                à soi. C’est pourquoi Arcenciel Manwema s’adresse à toutes les
                personnes afro et afro-descendantes qui souhaitent renouer avec leur
                patrimoine capillaire, en toute fierté.
              </p>
            </div>

            <div>
              <strong className="text-gray-900 block mb-2 font-serif text-xl">Rejoignez le mouvement</strong>
              <p className="text-base leading-relaxed text-gray-600">
                Découvrez nos conseils, nos produits, nos ateliers et nos
                accompagnements. Que vous soyez en transition, en quête de soin ou
                simplement en recherche d’inspiration, Arcenciel Manwema est là pour
                vous guider, vous soutenir et vous célébrer. Reconcil’ Afro Beauty
                by Arcenciel Manwema – La beauté de vos racines, révélée avec amour.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
