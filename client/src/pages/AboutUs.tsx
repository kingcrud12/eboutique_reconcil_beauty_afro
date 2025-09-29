import React from "react";

const AboutUs = () => {
  return (
    <div className="mt-[190px] px-6 py-16 bg-white text-slate-800">
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
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            <strong>Notre engagement</strong> <br />
            Arcenciel Manwema est bien plus qu&#39;une simple boutique en ligne.
            C’est un espace dédié à l’éveil, au soin et à la valorisation des
            cheveux crépus, bouclés et frisés. Nous vous aidons à comprendre,
            aimer et sublimer vos cheveux au naturel{" "}
          </p>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            <strong>Nos services</strong> <br />
            Accompagnement personnalisé : Diagnostic capillaire, coaching
            individuel ou en groupe pour mieux connaître vos cheveux. <br />{" "}
            Conseils &amp; expertise : <br /> Des recommandations adaptées à
            votre type de cheveux, vos habitudes et vos objectifs. <br />{" "}
            Coiffure : <br /> Des prestations en salon ou à domicile, avec des
            coiffures protectrices, naturelles ou créatives. <br /> Boutique en
            ligne : <br /> Une sélection rigoureuse de produits capillaires
            naturels, éthiques et adaptés aux besoins des cheveux afro.
          </p>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            <strong>Notre vision</strong> <br />
            Nous œuvrons pour une beauté libre, authentique et consciente. Nous
            croyons que se reconnecter à ses racines, c’est aussi se reconnecter
            à soi. C’est pourquoi Arcenciel Manwema s’adresse à toutes les
            personnes afro et afro-descendantes qui souhaitent renouer avec leur
            patrimoine capillaire, en toute fierté.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            <strong>Rejoignez le mouvement</strong> <br />
            Découvrez nos conseils, nos produits, nos ateliers et nos
            accompagnements. Que vous soyez en transition, en quête de soin ou
            simplement en recherche d’inspiration, Arcenciel Manwema est là pour
            vous guider, vous soutenir et vous célébrer. Reconcil’ Afro Beauty
            by Arcenciel Manwema – La beauté de vos racines, révélée avec amour.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
