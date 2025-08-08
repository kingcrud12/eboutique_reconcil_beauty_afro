import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import 'leaflet/dist/leaflet.css';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* 👈 englobe App ici */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
