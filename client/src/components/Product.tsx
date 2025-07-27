import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { IProduct } from '../api/product.interface';
import { Link } from 'react-router-dom';

function Product() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Erreur lors de la récupération des produits :", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  return (
    <div className="py-16 px-4 text-center bg-white">
      <h2 className="text-3xl font-bold text-gray-900">Nos Produits</h2>
      <p className="text-gray-500 mt-2 mb-10">Commandez pour vous ou vos proches</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <img
              src={`http://localhost:3003${product.imageUrl}`}
              alt={product.name}
              className="mx-auto h-40 object-contain"
            />
            <Link to={`/product/${product.id}`}>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-slate-500 mt-2">{product.description}</p>
              <p className="text-green-600 font-bold mt-1">{product.price} €</p>
            </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Product;
