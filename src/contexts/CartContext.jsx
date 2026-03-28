import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = (product, selectedSize = '1Kg', quantity = 1) => {
    setItems(current => {
      const existing = current.find(item => item.id === product.id && item.size === selectedSize);
      
      if (existing) {
        return current.map(item =>
          (item.id === product.id && item.size === selectedSize)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { ...product, size: selectedSize, quantity }];
    });
  };

  const removeFromCart = (id, size) => {
    setItems(curr => curr.filter(i => !(i.id === id && i.size === size)));
  };
  
  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) return;
    setItems(curr => 
      curr.map(item => 
        (item.id === id && item.size === size) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => {
    const weightValue = parseInt(item.size) || 1; 
    return sum + (item.price * weightValue * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return context;
};