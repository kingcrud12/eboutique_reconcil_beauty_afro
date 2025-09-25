// src/pages/Contact.tsx
import React, { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation basique
    if (!name || !email || !message) {
      alert("Merci de remplir tous les champs");
      return;
    }

    try {
      // Ici, tu peux envoyer le formulaire à ton API backend
      // const res = await fetch("/api/contact", { method: "POST", body: JSON.stringify({ name, email, message }) });

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6 sm:p-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Contactez-nous</h1>
      <p className="text-slate-600 mb-8">
        Remplissez le formulaire ci-dessous et nous vous répondrons dès que
        possible.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-6"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Nom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
        >
          Envoyer
        </button>

        {status === "success" && (
          <p className="text-green-600 font-medium mt-2">
            Votre message a été envoyé !
          </p>
        )}
        {status === "error" && (
          <p className="text-red-600 font-medium mt-2">
            Une erreur est survenue, veuillez réessayer.
          </p>
        )}
      </form>
    </section>
  );
}
