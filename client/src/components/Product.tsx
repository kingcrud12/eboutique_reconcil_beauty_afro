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

  const truncateText = (text: string, maxLength = 120): string => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength).trim() + '…' : text;
  };

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }
  return (
  <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-sans">
    <div className="max-w-7xl mx-auto text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Nos Produits
      </h2>
      <p className="text-gray-500 mt-2 mb-10 text-sm sm:text-base">
        Commandez pour vous ou vos proches
      </p>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white max-w-xs w-full mx-auto p-4 rounded-xl shadow hover:shadow-md transition flex flex-col items-center text-center"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-32 sm:h-40 object-contain mb-4"
            />
            <Link to={`/product/${product.id}`} className="w-full">
              <div>
                <h3 className="font-semibold text-gray-800 text-base mb-2 font-sans">
                  {product.name}
                </h3>
                <p className="text-sm text-slate-600 mt-1 text-center line-clamp-3">
                  {truncateText(product.description)}
                </p>
                <p className="text-green-600 font-bold mt-3 text-base">
                  {product.price} €
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);

}

export default Product;
