
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Homepage from "./Components/Pages/Homepage/Homepage.jsx";
import ProductDetails from "./Components/Pages/ProductDetails/ProductDetails.jsx";
import Login from "./Components/Login/Login.jsx";
import Cart from "./Components/Cart/Cart.jsx";
import Admin from "./Components/Admin/Admin.jsx";

import { ShopContextProvider } from "./Components/ShopContext/ShopContext.jsx";
import FloatingContact from "./Components/FloatingContact/FloatingContact.jsx";

function App() {
  const { pathname } = useLocation();

  return (
    <ShopContextProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {!pathname.startsWith("/admin") && <FloatingContact />}
    </ShopContextProvider>
  );
}

export default App;
