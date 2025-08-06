import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import api from '../api/api';
import { ICart } from '../api/cart.interface';
import { useAuth } from './AuthContext';

interface CartContextType {
  carts: ICart[];
  setCarts: React.Dispatch<React.SetStateAction<ICart[]>>;  // exposer le setter
  fetchCart: () => Promise<void>;
  totalCarts: number;
  firstCart: ICart | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [carts, setCarts] = useState<ICart[]>([]);
  const [firstCart, setFirstCart] = useState<ICart | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get<ICart[]>('/cart/user');
      const userCarts = res.data || [];
      setCarts(userCarts);
      setFirstCart(userCarts.length > 0 ? userCarts[0] : null);
    } catch {
      setCarts([]);
      setFirstCart(null);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const totalCarts = carts.length;

  const value = useMemo(() => ({
    carts,
    setCarts,
    fetchCart,
    totalCarts,
    firstCart,
  }), [carts, firstCart, fetchCart, totalCarts]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
