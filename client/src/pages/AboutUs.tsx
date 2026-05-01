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
              <strong>Reconcil' Afro Beauty By Arcenciel Mawema</strong>, est un
              repère qui encourage et aide les personnes aux cheveux crépus, frisés et bouclés à
              se réconcilier avec leur identité capillaire. Chez Arcenciel
              Mawema, nous croyons que vos cheveux ne sont pas seulement une
              texture, mais un héritage, une force et une fierté. Notre mission :
              vous accompagner dans votre <strong>routine capillaire naturelle</strong>.
            </p>

            <section className="mb-8">
              <h2 className="text-gray-900 mb-3 font-serif text-2xl font-bold">Notre Engagement pour vos Cheveux Afro</h2>
              <p className="text-base leading-relaxed text-gray-600">
                Arcenciel Mawema est bien plus qu&#39;une simple boutique en ligne.
                C’est un espace dédié à l’éveil, au soin et à la valorisation des
                cheveux texturés. Que vous cherchiez une solution pour l'hydratation, la pousse ou 
                l'entretien quotidien, nous vous aidons à comprendre, aimer et sublimer vos cheveux au naturel
                grâce à des ingrédients authentiques comme l'huile de chébé ou le carthame.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-gray-900 mb-4 font-serif text-2xl font-bold">Nos Services & Expertises</h2>
              <ul className="space-y-4 text-base text-gray-600">
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <h3 className="inline font-bold text-gray-800">Accompagnement capillaire personnalisé :</h3> Diagnostic de porosité, coaching individuel ou en groupe pour établir votre routine cheveux crépus idéale.
                </li>
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <h3 className="inline font-bold text-gray-800">Conseils d'experts :</h3> Des recommandations ciblées selon vos besoins (cheveux secs, cassants, cuir chevelu sensible) et vos objectifs de longueur.
                </li>
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <h3 className="inline font-bold text-gray-800">Salon de coiffure :</h3> Des prestations en salon ou à domicile, spécialisées dans les coiffures protectrices (tresses, twists) et les soins profonds.
                </li>
                <li className="pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-sage-400 before:rounded-full">
                  <h3 className="inline font-bold text-gray-800">Boutique de cosmétiques naturels :</h3> Une sélection rigoureuse de produits (huiles pures, beurres, shampoings doux) éthiques et parfaitement adaptés à la fibre afro.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-gray-900 mb-3 font-serif text-2xl font-bold">Notre Vision de la Beauté Naturelle</h2>
              <p className="text-base leading-relaxed text-gray-600">
                Nous œuvrons pour une beauté libre, authentique et consciente. Nous
                croyons que se reconnecter à ses racines, c’est aussi se reconnecter
                à soi. C’est pourquoi nous nous adressons à toutes les
                personnes souhaitant renouer avec leur patrimoine capillaire, en abandonnant les produits chimiques pour des soins naturels, en toute fierté.
              </p>
            </section>

            <section>
              <h2 className="text-gray-900 mb-3 font-serif text-2xl font-bold">Rejoignez le mouvement</h2>
              <p className="text-base leading-relaxed text-gray-600">
                Découvrez nos conseils d'entretien, nos cosmétiques bio, nos ateliers et nos
                accompagnements. Que vous soyez en phase de transition capillaire (retour au naturel), en quête d'hydratation ou
                simplement en recherche d’inspiration, l'équipe est là pour
                vous guider. Reconcil’ Afro Beauty
                by Arcenciel Mawema – La beauté de vos racines, révélée avec amour.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
