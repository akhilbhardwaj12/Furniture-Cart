
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../ShopContext/ShopContext.jsx";
import "./Cart.css";

const Cart = () => {
  const {
    cart,
    total,
    itemAmount,
    increaseAmount,
    decreaseAmount,
    removeFromCart,
    clearCart,
  } = useContext(ShopContext);

  const shipping = total >= 100 || total === 0 ? 0 : 10;
  const grandTotal = total + shipping;

  return (
    <main className="lux-cart-page">
      <div className="lux-cart-container">
        <div className="lux-cart-heading">
          <span className="lux-cart-eyebrow">YOUR SELECTION</span>
          <h1>Shopping bag</h1>
          <p>
            {itemAmount} {itemAmount === 1 ? "item" : "items"} selected
            for your home.
          </p>
        </div>

        {cart.length === 0 ? (
          <section className="lux-cart-empty">
            <div className="lux-cart-empty-icon">♡</div>
            <h2>A little space for something beautiful.</h2>
            <p>Your shopping bag is waiting for your first selection.</p>
            <Link to="/" className="lux-cart-primary">
              Explore the collection <span>↗</span>
            </Link>
          </section>
        ) : (
          <div className="lux-cart-layout">
            <section className="lux-cart-items">
              <div className="lux-cart-items-heading">
                <span>PRODUCT</span>
                <button type="button" onClick={clearCart}>
                  Clear bag
                </button>
              </div>

              {cart.map((item) => (
                <article className="lux-cart-item" key={item.id}>
                  <Link
                    to={`/product/${item.id}`}
                    className="lux-cart-item-image"
                  >
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className="lux-cart-item-info">
                    <span className="lux-cart-item-category">
                      {item.category}
                    </span>

                    <Link
                      to={`/product/${item.id}`}
                      className="lux-cart-item-name"
                    >
                      {item.name}
                    </Link>

                    <span className="lux-cart-item-price">
                      ${Number(item.price).toLocaleString("en-US")}
                    </span>

                    <div className="lux-cart-item-controls">
                      <div className="lux-quantity-control">
                        <button
                          type="button"
                          onClick={() => decreaseAmount(item.id)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>{item.amount}</span>

                        <button
                          type="button"
                          onClick={() => increaseAmount(item.id)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="lux-cart-remove"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="lux-cart-item-subtotal">
                    ${(Number(item.price) * item.amount).toLocaleString("en-US")}
                  </div>
                </article>
              ))}

              <Link to="/" className="lux-cart-continue">
                ← Continue shopping
              </Link>
            </section>

            <aside className="lux-order-summary">
              <span className="lux-order-eyebrow">YOUR ORDER</span>
              <h2>Order summary</h2>

              <div className="lux-order-line">
                <span>Subtotal ({itemAmount} items)</span>
                <span>${total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>

              <div className="lux-order-line">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : `$${shipping.toFixed(2)}`}</span>
              </div>

              <p className="lux-shipping-note">
                {shipping === 0
                  ? "Shipping estimate: complimentary."
                  : "Spend $100 or more for complimentary shipping."}
              </p>

              <div className="lux-order-total">
                <span>Total</span>
                <strong>
                  ${grandTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>

              <button
                type="button"
                className="lux-checkout-button"
                onClick={() =>
                  alert("Checkout is not connected yet. Your cart is saved in this session.")
                }
              >
                Proceed to checkout <span>↗</span>
              </button>

              <div className="lux-checkout-note">
                <span>◇</span>
                Secure checkout experience
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
