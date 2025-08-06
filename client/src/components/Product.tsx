import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { IProduct } from '../api/product.interface';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Popin from '../components/Popin';

function Product() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [popinMsg, setPopinMsg] = useState<string | null>(null);

  const { fetchCart, firstCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error("Erreur récupération produits :", err);
        setPopinMsg("Erreur chargement produits");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated || !user) {
      setPopinMsg("Veuillez vous connecter pour ajouter un produit.");
      return;
    }

    setAddingToCart(productId);

    try {
      let cartId: number;

      if (!firstCart) {
        const res = await api.post('/cart', {
          userId: user.id,
          items: [{ productId, quantity: 1 }],
        });
        cartId = res.data.id;
      } else {
        cartId = firstCart.id;
        await api.put(`/cart/${cartId}`, {
          items: [{ productId, quantity: 1 }],
        });
      }

      await fetchCart();
      setPopinMsg("Produit ajouté au panier !");
    } catch (err) {
      console.error('Erreur ajout panier :', err);
      setPopinMsg("Impossible d’ajouter au panier.");
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Chargement des produits...</div>;
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-sans">
      {popinMsg && <Popin message={popinMsg} onClose={() => setPopinMsg(null)} />}

      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Nos Produits</h2>
        <p className="text-gray-500 mt-2 mb-10 text-sm sm:text-base">
          Commandez pour vous ou vos proches
        </p>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white max-w-xs w-full mx-auto p-4 rounded-xl shadow hover:shadow-md flex flex-col items-center text-center"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-32 sm:h-40 object-contain mb-4"
              />
              <Link to={`/product/${product.id}`} className="w-full">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-3">
                    {product.description.slice(0, 120)}…
                  </p>
                  <p className="text-green-600 font-bold mt-3">{product.price} €</p>
                </div>
              </Link>
              <button
                onClick={() => handleAddToCart(product.id)}
                disabled={addingToCart === product.id}
                className={`mt-4 px-4 py-2 text-white rounded ${
                  addingToCart === product.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-blue-700'
                }`}
              >
                {addingToCart === product.id ? 'Ajout...' : 'Ajouter au panier'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Product;
