import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Budget, BudgetItem, Product } from '../types';

interface CartState {
  items: BudgetItem[];
  clientId: string | null;
  eventDate: string | null;
  eventAddress: string;
  discount: number;
  notes: string;
}

interface CartContextValue {
  cart: CartState;
  addItem: (product: Product, quantity: number, startDate: string, endDate: string) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, quantity: number) => void;
  setClient: (clientId: string) => void;
  setEventInfo: (date: string, address: string) => void;
  setDiscount: (discount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getTotalValue: () => number;
  getFinalValue: () => number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: BudgetItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'SET_CLIENT'; payload: string }
  | { type: 'SET_EVENT_INFO'; payload: { date: string; address: string } }
  | { type: 'SET_DISCOUNT'; payload: number }
  | { type: 'SET_NOTES'; payload: string }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  clientId: null,
  eventDate: null,
  eventAddress: '',
  discount: 0,
  notes: '',
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId &&
                item.startDate === action.payload.startDate &&
                item.endDate === action.payload.endDate
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
          totalPrice: (updatedItems[existingItemIndex].quantity + action.payload.quantity) * action.payload.unitPrice,
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity, totalPrice: action.payload.quantity * item.unitPrice }
            : item
        ),
      };

    case 'SET_CLIENT':
      return { ...state, clientId: action.payload };

    case 'SET_EVENT_INFO':
      return {
        ...state,
        eventDate: action.payload.date,
        eventAddress: action.payload.address,
      };

    case 'SET_DISCOUNT':
      return { ...state, discount: action.payload };

    case 'SET_NOTES':
      return { ...state, notes: action.payload };

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product: Product, quantity: number, startDate: string, endDate: string) => {
    const item: BudgetItem = {
      id: Date.now().toString(), // Em produção, use uma função de ID melhor
      productId: product.id,
      product,
      quantity,
      unitPrice: product.price,
      totalPrice: quantity * product.price,
      startDate,
      endDate,
    };
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateItem = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
  };

  const setClient = (clientId: string) => {
    dispatch({ type: 'SET_CLIENT', payload: clientId });
  };

  const setEventInfo = (date: string, address: string) => {
    dispatch({ type: 'SET_EVENT_INFO', payload: { date, address } });
  };

  const setDiscount = (discount: number) => {
    dispatch({ type: 'SET_DISCOUNT', payload: discount });
  };

  const setNotes = (notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: notes });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalValue = () => {
    return cart.items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const getFinalValue = () => {
    const total = getTotalValue();
    return total - (total * cart.discount / 100);
  };

  const value: CartContextValue = {
    cart,
    addItem,
    removeItem,
    updateItem,
    setClient,
    setEventInfo,
    setDiscount,
    setNotes,
    clearCart,
    getTotalValue,
    getFinalValue,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
