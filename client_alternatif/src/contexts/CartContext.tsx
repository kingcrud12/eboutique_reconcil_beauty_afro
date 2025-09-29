import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import api from "../connect_to_api/api";
import { ICart } from "../connect_to_api/cart.interface";
import { useAuth } from "./AuthContext";

interface CartContextType {
  carts: ICart[];
  setCarts: React.Dispatch<React.SetStateAction<ICart[]>>;
  fetchCart: () => Promise<void>;
  totalItems: number;
  totalQuantity: number;
  firstCart: ICart | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [carts, setCarts] = useState<ICart[]>([]);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get<ICart[]>("/carts/users/me");
      setCarts(res.data || []);
    } catch {
      setCarts([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCart();
    } else {
      setCarts([]);
    }
  }, [isAuthenticated, fetchCart]);

  const firstCart = carts.length > 0 ? carts[0] : null;
  const totalItems = firstCart?.items?.length ?? 0;
  const totalQuantity =
    firstCart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const value = useMemo(
    () => ({
      carts,
      setCarts,
      fetchCart,
      totalItems,
      totalQuantity,
      firstCart,
    }),
    [carts, fetchCart, totalItems, totalQuantity, firstCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
