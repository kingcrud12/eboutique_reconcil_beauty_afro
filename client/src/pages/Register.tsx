import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import api from "../api/api";


const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await api.post("/user", {
        firstName,
        lastName,
        email,
        password,
      });
  
      if (response.status === 201 || response.status === 200) {
        navigate("/Check");
      } else {
        setError("Une erreur inattendue s’est produite.");
      }
    } catch (error: any) {
      console.error("Erreur d'inscription :", error);
  
      if (error.response?.status === 400) {
        setError("Cette adresse email est déjà utilisée.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };
  

  return (
    <div className="mt-[90px] flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Créer un compte</h2>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 font-semibold"
          >
            S’inscrire
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Déjà un compte ?{" "}
          <Link to="/Login" className="text-slate-800 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
