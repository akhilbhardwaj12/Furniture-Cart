
import { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../ShopContext/ShopContext.jsx";
import { formatCurrency } from "../../api.js";
import "./ProductList.css";

const ProductList = ({ category }) => {
  const { products, addToCart, cart } = useContext(ShopContext);

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  const getCartAmount = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.amount : 0;
  };

  return (
    <section className="lux-products" id="featured">
      <div className="lux-products-heading">
        <div>
          <span className="lux-products-eyebrow">THE COLLECTION</span>
          <h2>Considered pieces.<br />Beautiful spaces.</h2>
          <p>
            Discover thoughtfully selected furniture for everyday living.
          </p>
        </div>

        <span className="lux-products-count">
          {filteredProducts.length} PRODUCTS
        </span>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="lux-products-empty">
          <h3>Nothing here just yet</h3>
          <p>Try another category to explore our collection.</p>
        </div>
      ) : (
        <div className="lux-products-grid">
          {filteredProducts.map((product, index) => (
            <article className="lux-product-card" key={product.id}>
              <Link
                to={`/product/${product.id}`}
                className="lux-product-image"
                aria-label={`View ${product.name}`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading={index > 3 ? "lazy" : "eager"}
                />

                <span className="lux-product-category">
                  {product.category}
                </span>

                <span className="lux-product-view">
                  View details <span aria-hidden="true">↗</span>
                </span>
              </Link>

              <div className="lux-product-info">
                <div className="lux-product-copy">
                  <Link
                    to={`/product/${product.id}`}
                    className="lux-product-name"
                  >
                    {product.name}
                  </Link>

                  <p className="lux-product-caption">
                    Thoughtfully chosen for your home
                  </p>
                </div>

                <div className="lux-product-bottom">
                  <span className="lux-product-price">
                    {formatCurrency(product.price)}
                  </span>

                  <button
                    type="button"
                    className="lux-product-add"
                    onClick={() => addToCart(product, product.id)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <span aria-hidden="true">+</span>
                    <span>Add</span>
                  </button>
                </div>

                {getCartAmount(product.id) > 0 && (
                  <p className="lux-product-cart-status">
                    {getCartAmount(product.id)} in your bag
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductList;
