
import React from "react";
import { Routes, Route } from "react-router-dom";

import Homepage from "./Components/Pages/Homepage/Homepage.jsx";
import ProductDetails from "./Components/Pages/ProductDetails/ProductDetails.jsx";
import Login from "./Components/Login/Login.jsx";
import Cart from "./Components/Cart/Cart.jsx";

import { ShopContextProvider } from "./Components/ShopContext/ShopContext.jsx";
import FloatingContact from "./Components/FloatingContact/FloatingContact.jsx";

function App() {
  return (
    <ShopContextProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      <FloatingContact />
    </ShopContextProvider>
  );
}

export default App;
