
import React, { useState } from "react";

import Navbar from "../../Navbar/Navbar.jsx";
import Hero from "../../Hero/Hero.jsx";
import Category from "../../Category/Category.jsx";
import ProductList from "../../ProductList/ProductList.jsx";
import Footer from "../../Footer/Footer.jsx";

const Homepage = () => {
  const [category, setCategory] = useState("All");

  return (
    <div>
      <Navbar />

      <Hero />

      <Category
        category={category}
        setCategory={setCategory}
      />

      <ProductList category={category} />

      <Footer />
    </div>
  );
};

export default Homepage;
