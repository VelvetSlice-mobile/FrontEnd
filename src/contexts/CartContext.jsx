import PropTypes from "prop-types";
import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const addToCart = (product, selectedSize = "1Kg", quantity = 1) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.size === selectedSize,
      );
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...current, { ...product, size: selectedSize, quantity }];
    });
  };

  const removeFromCart = (id, size) => {
    setItems((curr) => curr.filter((i) => !(i.id === id && i.size === size)));
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity < 1) return;
    setItems((curr) =>
      curr.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item,
      ),
    );
  };

  const updateItem = (oldItem, updatedItem) => {
    setItems((curr) => {
      const filtered = curr.filter(
        (item) => !(item.id === oldItem.id && item.size === oldItem.size),
      );
      return [...filtered, { ...oldItem, ...updatedItem }];
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (couponData) => setAppliedCoupon(couponData);
  const removeCoupon = () => setAppliedCoupon(null);

  const total = items.reduce((sum, item) => {
    const weightValue = Number.parseInt(item.size) || 1;
    return sum + item.price * weightValue * item.quantity;
  }, 0);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateItem,
      clearCart,
      total,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, total, appliedCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  return context;
};
