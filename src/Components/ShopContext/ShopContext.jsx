
import {
  createContext,
  useState,
  useEffect,
} from "react";

import { product_list } from "../../data.jsx";
import { apiRequest } from "../../api.js";

export const ShopContext = createContext();

const getSavedCart = () => {
  try {
    const savedCart = localStorage.getItem("arve-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error("Unable to load saved cart:", error);
    return [];
  }
};

export const ShopContextProvider = ({ children }) => {
  const [catalog, setCatalog] = useState(product_list);
  const [cart, setCart] = useState(getSavedCart);

  const [itemAmount, setItemAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("arve-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    apiRequest("/products")
      .then(({ products: savedProducts }) => {
        if (savedProducts.length > 0) setCatalog(savedProducts);
      })
      .catch((error) => {
        console.error("Unable to load the saved product catalog:", error);
      });
  }, []);

  // Calculate total quantity and price
  useEffect(() => {
    const quantity = cart.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const cartTotal = cart.reduce(
      (sum, item) => sum + Number(item.price) * item.amount,
      0
    );

    setItemAmount(quantity);
    setTotal(cartTotal);
  }, [cart]);

  // Add product to cart
  const addToCart = (product, id = product.id) => {
    if (!product) return;

    const productId = Number(id);

    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (item) => Number(item.id) === productId
      );

      if (existingItem) {
        return previousCart.map((item) =>
          Number(item.id) === productId
            ? { ...item, amount: item.amount + 1 }
            : item
        );
      }

      return [
        ...previousCart,
        { ...product, id: productId, amount: 1 },
      ];
    });
  };

  // Remove product completely
  const removeFromCart = (id) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => Number(item.id) !== Number(id)
      )
    );
  };

  // Clear entire cart
  const clearCart = () => setCart([]);

  // Increase quantity
  const increaseAmount = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        Number(item.id) === Number(id)
          ? { ...item, amount: item.amount + 1 }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseAmount = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          Number(item.id) === Number(id)
            ? { ...item, amount: item.amount - 1 }
            : item
        )
        .filter((item) => item.amount > 0)
    );
  };

  return (
    <ShopContext.Provider
      value={{
        products: catalog,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        increaseAmount,
        decreaseAmount,
        itemAmount,
        total,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
