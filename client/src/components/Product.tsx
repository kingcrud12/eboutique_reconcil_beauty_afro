import React from 'react';

const products = [
  { name: 'Spiced Mint', price: '9.99$', image: '/image_1.png' },
  { name: 'Sweet Strawberry', price: '9.99$', image: '/image_2.png' },
  { name: 'Cool Blueberries', price: '9.99$', image: '/image_3.png' },
  { name: 'Juicy Lemon', price: '9.99$', image: '/image_1.png' },
  { name: 'Product name', price: '9.99$', image: '/image_1.png' },
  { name: 'Fragrant Cinnamon', price: '9.99$', image: '/image_1.png' },
  { name: 'Summer Cherries', price: '9.99$', image: 'image_1.png' },
  { name: 'Clean Lavander', price: '9.99$', image: '/image_1.png' },
];

function Product() {
  return (
    <div className="py-16 px-4 text-center bg-white">
      <h2 className="text-3xl font-bold text-gray-900">Nos Produits</h2>
      <p className="text-gray-500 mt-2 mb-10">Order it for you or for your beloved ones</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {products.map((product, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-md transition">
            <img
              src={product.image}
              alt={product.name}
              className="mx-auto h-40 object-contain"
            />
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-green-600 font-bold mt-1">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Product;
