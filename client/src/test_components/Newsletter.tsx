import React from "react";

export default function Newsletter() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Restez informée de nos nouveautés
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Recevez nos conseils beauté et découvrez en avant-première nos
          nouveaux produits
        </p>
        <form
          className="max-w-md mx-auto flex gap-4"
          id="newsletter-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Merci ! (form submit simulé)");
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Votre adresse email"
            className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <button
            type="submit"
            className="bg-teal-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-teal-700 whitespace-nowrap cursor-pointer"
          >
            S'abonner
          </button>
        </form>
      </div>
    </section>
  );
}
