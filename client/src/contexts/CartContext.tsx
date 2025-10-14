import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import api from "../connect_to_api/api";
import { ICart } from "../connect_to_api/cart.interface";
import { useAuth } from "./AuthContext";

interface CartContextType {
  carts: ICart[];
  setCarts: React.Dispatch<React.SetStateAction<ICart[]>>;
  fetchCart: () => Promise<void>;
  // Guest cart helpers
  getGuestCartUuid: () => string;
  createGuestCart: (data?: Record<string, unknown>) => Promise<ICart | null>;
  fetchGuestCart: () => Promise<void>;
  updateGuestCart: (data: Record<string, unknown>) => Promise<ICart | null>;
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
  const creatingGuestRef = useRef(false);

  // Guest cart UUID persistence
  const getGuestCartUuid = useCallback((): string => {
    let uuid = localStorage.getItem("guest_cart_uuid");
    if (!uuid) {
      // Prefer secure random UUID when available
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        uuid = (crypto as unknown as { randomUUID: () => string }).randomUUID();
      } else {
        // Fallback simple UUID v4-ish generator
        uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem("guest_cart_uuid", uuid);
    }
    return uuid;
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get<ICart[]>("/carts/users/me");
      setCarts(res.data || []);
    } catch {
      setCarts([]);
    }
  }, []);

  const createGuestCart = useCallback(async (data?: Record<string, unknown>): Promise<ICart | null> => {
    const uuid = getGuestCartUuid();
    if (creatingGuestRef.current) return null;
    creatingGuestRef.current = true;
    try {
      const payload = (data && typeof data === "object") ? data : { items: [] };
      const res = await api.post<ICart>(`/carts/${uuid}` , payload);
      const cart = res.data ?? null;
      setCarts(cart ? [cart] : []);
      return cart;
    } catch (error) {
      return null;
    } finally {
      creatingGuestRef.current = false;
    }
  }, [getGuestCartUuid]);

  const fetchGuestCart = useCallback(async (): Promise<void> => {
    const uuid = getGuestCartUuid();
    try {
      const res = await api.get<ICart>(`/carts/${uuid}`);
      const cart = res.data ?? null;
      setCarts(cart ? [cart] : []);
    } catch (error: unknown) {
      // GET only: do not auto-create here to avoid GET before POST
      setCarts([]);
    }
  }, [getGuestCartUuid]);

  const updateGuestCart = useCallback(
    async (data: Record<string, unknown>): Promise<ICart | null> => {
      const uuid = getGuestCartUuid();
      try {
        const res = await api.patch<ICart>(`/carts/${uuid}` , data);
        const cart = res.data ?? null;
        setCarts(cart ? [cart] : []);
        return cart;
      } catch (error) {
        return null;
      }
    },
    [getGuestCartUuid]
  );

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCart();
    } else {
      // Ne plus créer automatiquement: seulement tenter un GET
      void fetchGuestCart();
    }
  }, [isAuthenticated, fetchCart, fetchGuestCart]);

  // 👉 dérivé de carts
  const firstCart = carts.length > 0 ? carts[0] : null;
  const totalItems = firstCart?.items?.length ?? 0;
  const totalQuantity =
    firstCart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const value = useMemo(
    () => ({
      carts,
      setCarts,
      fetchCart,
      getGuestCartUuid,
      createGuestCart,
      fetchGuestCart,
      updateGuestCart,
      totalItems,
      totalQuantity,
      firstCart,
    }),
    [
      carts,
      fetchCart,
      getGuestCartUuid,
      createGuestCart,
      fetchGuestCart,
      updateGuestCart,
      totalItems,
      totalQuantity,
      firstCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
