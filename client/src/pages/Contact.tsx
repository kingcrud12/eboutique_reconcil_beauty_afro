import React, { useState } from "react";
import api from "../connect_to_api/api";
import { Mail, Send } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) { alert("Merci de remplir tous les champs"); return; }
    setStatus("loading");
    try {
      await api.post("/contact", { name, email, message });
      setStatus("success");
      setName(""); setEmail(""); setMessage("");
    } catch (err) {
      console.error("Erreur envoi contact :", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[80vh] bg-white">
      {/* Header */}
      <div className="bg-sage-50 py-14 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-sage-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-3">Contactez-nous</h1>
          <p className="text-gray-500 text-base">
            Remplissez le formulaire ci-dessous et nous vous répondrons dès que possible.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-6">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Nom</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors" />
          </div>

          <div>
            <label htmlFor="message" className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Message</label>
            <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-sm focus:outline-none focus:border-sage-500 transition-colors resize-none" />
          </div>

          <button type="submit" disabled={status === "loading"}
            className="w-full bg-sage-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            {status === "loading" ? "Envoi..." : "Envoyer"}
          </button>

          {status === "success" && (
            <p className="text-sage-600 font-medium text-sm text-center">✅ Votre message a été envoyé !</p>
          )}
          {status === "error" && (
            <p className="text-red-500 font-medium text-sm text-center">❌ Une erreur est survenue, veuillez réessayer.</p>
          )}
        </form>
      </div>
    </div>
  );
}
