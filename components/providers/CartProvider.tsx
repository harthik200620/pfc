"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { DISHES_BY_ID, PACKAGING_FEE } from "@/data/menu";
import { HALLS_BY_ID } from "@/data/halls";
import { deliveryFeeForId, etaForId } from "@/lib/delivery";
import { readStore, writeStore, STORE_KEYS } from "@/lib/storage";
import type { CartState, Dish } from "@/lib/types";

type Action =
  | { type: "hydrate"; state: CartState }
  | { type: "add"; dishId: string; qty?: number }
  | { type: "setQty"; dishId: string; qty: number }
  | { type: "remove"; dishId: string }
  | { type: "setHall"; hallId: string }
  | { type: "setTreat"; on: boolean }
  | { type: "setHeads"; heads: number }
  | { type: "clear" };

const EMPTY: CartState = { lines: [], hallId: null, treatMode: false, heads: 4 };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "add": {
      const qty = action.qty ?? 1;
      const existing = state.lines.find((l) => l.dishId === action.dishId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.dishId === action.dishId ? { ...l, qty: Math.min(l.qty + qty, 99) } : l,
          ),
        };
      }
      return { ...state, lines: [...state.lines, { dishId: action.dishId, qty }] };
    }

    case "setQty": {
      if (action.qty <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.dishId !== action.dishId) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.dishId === action.dishId ? { ...l, qty: Math.min(action.qty, 99) } : l,
        ),
      };
    }

    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.dishId !== action.dishId) };

    case "setHall":
      return { ...state, hallId: action.hallId };

    case "setTreat":
      return { ...state, treatMode: action.on };

    case "setHeads":
      return { ...state, heads: Math.max(1, Math.min(action.heads, 40)) };

    case "clear":
      return { ...EMPTY, hallId: state.hallId };

    default:
      return state;
  }
}

export interface CartLineView {
  dish: Dish;
  qty: number;
  lineTotal: number;
}

interface CartContextValue {
  state: CartState;
  lines: CartLineView[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  total: number;
  etaMinutes: number | null;
  hallName: string | null;
  add: (dishId: string, qty?: number) => void;
  setQty: (dishId: string, qty: number) => void;
  remove: (dishId: string) => void;
  setHall: (hallId: string) => void;
  setTreat: (on: boolean) => void;
  setHeads: (heads: number) => void;
  clear: () => void;
  qtyOf: (dishId: string) => number;
  isOpen: boolean;
  openCart: (opts?: { treat?: boolean }) => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate after mount, never during render — server has no localStorage and
  // a mismatch here would blow up the whole tree.
  useEffect(() => {
    const saved = readStore<CartState | null>(STORE_KEYS.cart, null);
    if (saved && Array.isArray(saved.lines)) {
      dispatch({
        type: "hydrate",
        state: {
          lines: saved.lines.filter((l) => DISHES_BY_ID.has(l.dishId)),
          hallId: saved.hallId && HALLS_BY_ID.has(saved.hallId) ? saved.hallId : null,
          treatMode: Boolean(saved.treatMode),
          heads: typeof saved.heads === "number" ? saved.heads : 4,
        },
      });
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStore(STORE_KEYS.cart, state);
  }, [state, hydrated]);

  // Lock the page behind the cart panel.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const lines = useMemo<CartLineView[]>(
    () =>
      state.lines.flatMap((l) => {
        const dish = DISHES_BY_ID.get(l.dishId);
        if (!dish) return [];
        return [{ dish, qty: l.qty, lineTotal: dish.price * l.qty }];
      }),
    [state.lines],
  );

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);
  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const deliveryFee = state.lines.length > 0 ? deliveryFeeForId(state.hallId) : 0;
  const packagingFee = state.lines.length > 0 ? PACKAGING_FEE : 0;

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      lines,
      count,
      subtotal,
      deliveryFee,
      packagingFee,
      total: subtotal + deliveryFee + packagingFee,
      etaMinutes: etaForId(state.hallId),
      hallName: state.hallId ? (HALLS_BY_ID.get(state.hallId)?.name ?? null) : null,
      add: (dishId, qty) => dispatch({ type: "add", dishId, qty }),
      setQty: (dishId, qty) => dispatch({ type: "setQty", dishId, qty }),
      remove: (dishId) => dispatch({ type: "remove", dishId }),
      setHall: (hallId) => dispatch({ type: "setHall", hallId }),
      setTreat: (on) => dispatch({ type: "setTreat", on }),
      setHeads: (heads) => dispatch({ type: "setHeads", heads }),
      clear: () => dispatch({ type: "clear" }),
      qtyOf: (dishId) => state.lines.find((l) => l.dishId === dishId)?.qty ?? 0,
      isOpen,
      openCart: (opts) => {
        if (opts?.treat) dispatch({ type: "setTreat", on: true });
        setIsOpen(true);
      },
      closeCart: () => setIsOpen(false),
    }),
    [state, lines, count, subtotal, deliveryFee, packagingFee, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Stable callback for "add and tell the user", used from several places. */
export function useAddToCart() {
  const { add } = useCart();
  return useCallback((dishId: string, qty = 1) => add(dishId, qty), [add]);
}
