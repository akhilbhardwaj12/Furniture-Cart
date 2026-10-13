
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../ShopContext/ShopContext.jsx";
import { apiRequest, formatCurrency } from "../../api.js";
import "./Cart.css";

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay Checkout. Please try again."));
    document.body.appendChild(script);
  });

const Cart = () => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

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
  const paymentMethods = [
    { id: "cod", name: "Cash on Delivery", detail: "Pay when your furniture arrives" },
    {
      id: "razorpay",
      name: "Pay online with Razorpay",
      detail: "Cards, UPI, netbanking and more",
    },
  ];
  const selectedPayment = paymentMethods.find(
    (method) => method.id === paymentMethod
  );

  const openCheckout = () => {
    setPaymentMethod("cod");
    setCheckoutOpen(true);
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setCheckoutError("");
    setPlacingOrder(true);

    const formData = new FormData(event.currentTarget);
    const customer = {
      fullName: formData.get("name"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      postalCode: formData.get("postalCode"),
    };

    const orderRequest = {
      customer,
      items: cart.map((item) => ({
        productId: item.id,
        quantity: item.amount,
      })),
    };

    try {
      if (paymentMethod === "cod") {
        const { order } = await apiRequest("/orders", {
          method: "POST",
          body: JSON.stringify({ ...orderRequest, paymentMethod: "cod" }),
        });
        setOrderNumber(String(order.id).slice(-8).toUpperCase());
        clearCart();
        setOrderPlaced(true);
        return;
      }

      await loadRazorpayCheckout();
      const { key, order } = await apiRequest("/orders/razorpay/create", {
        method: "POST",
        body: JSON.stringify(orderRequest),
      });
      let verificationStarted = false;
      const checkout = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: "ARVÉ Furniture",
        description: "Furniture order",
        order_id: order.razorpayOrderId,
        prefill: {
          name: customer.fullName,
          email: customer.email,
        },
        theme: { color: "#334b3d" },
        handler: async (paymentResponse) => {
          verificationStarted = true;
          try {
            await apiRequest(`/orders/${order.id}/razorpay/verify`, {
              method: "POST",
              body: JSON.stringify(paymentResponse),
            });
            setOrderNumber(String(order.id).slice(-8).toUpperCase());
            clearCart();
            setOrderPlaced(true);
          } catch (error) {
            setCheckoutError(error.message);
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!verificationStarted) {
              setPlacingOrder(false);
              setCheckoutError("Payment was not completed. Your bag is unchanged.");
            }
          },
        },
      });
      checkout.on("payment.failed", (paymentResponse) => {
        setCheckoutError(
          paymentResponse.error?.description ||
            "Razorpay could not complete the payment. Please try again."
        );
        setPlacingOrder(false);
      });
      checkout.open();
    } catch (error) {
      setCheckoutError(error.message);
      setPlacingOrder(false);
    } finally {
      if (paymentMethod === "cod") setPlacingOrder(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setOrderPlaced(false);
    setCheckoutError("");
    setOrderNumber("");
  };

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
                      {formatCurrency(item.price)}
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
                    {formatCurrency(Number(item.price) * item.amount)}
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
                <span>{formatCurrency(total)}</span>
              </div>

              <div className="lux-order-line">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Complimentary" : formatCurrency(shipping)}
                </span>
              </div>

              <p className="lux-shipping-note">
                {shipping === 0
                  ? "Shipping estimate: complimentary."
                  : "Spend ₹100 or more for complimentary shipping."}
              </p>

              <div className="lux-order-total">
                <span>Total</span>
                <strong>
                  {formatCurrency(grandTotal)}
                </strong>
              </div>

              <button
                type="button"
                className="lux-checkout-button"
                onClick={openCheckout}
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

      {checkoutOpen && (
        <div className="lux-checkout-overlay">
          <section
            className="lux-checkout-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lux-checkout-title"
          >
            <button
              type="button"
              className="lux-checkout-close"
              onClick={closeCheckout}
              aria-label="Close checkout"
            >
              ×
            </button>

            {orderPlaced ? (
              <div className="lux-order-confirmation">
                <span className="lux-confirmation-mark" aria-hidden="true">✓</span>
                <span className="lux-order-eyebrow">ORDER CONFIRMED</span>
                <h2 id="lux-checkout-title">Thank you for your order.</h2>
                <p>
                  Order #{orderNumber} is confirmed with{" "}
                  {selectedPayment?.name}.
                </p>
                <button
                  type="button"
                  className="lux-checkout-submit"
                  onClick={closeCheckout}
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <span className="lux-order-eyebrow">SECURE CHECKOUT</span>
                <h2 id="lux-checkout-title">Delivery & payment</h2>
                <p className="lux-checkout-demo-note">
                  Online payments are securely processed by Razorpay. Your
                  payment details are never stored by ARVÉ.
                </p>

                <form onSubmit={placeOrder}>
                  <fieldset className="lux-checkout-fieldset">
                    <legend>Delivery details</legend>
                    <div className="lux-checkout-fields">
                      <label>
                        Full name
                        <input name="name" autoComplete="name" required />
                      </label>
                      <label>
                        Email address
                        <input
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                        />
                      </label>
                      <label className="lux-checkout-field-full">
                        Delivery address
                        <input
                          name="address"
                          autoComplete="street-address"
                          required
                        />
                      </label>
                      <label>
                        City
                        <input name="city" autoComplete="address-level2" required />
                      </label>
                      <label>
                        Postal code
                        <input
                          name="postalCode"
                          autoComplete="postal-code"
                          required
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="lux-checkout-fieldset lux-payment-fieldset">
                    <legend>Payment method</legend>
                    <div className="lux-payment-options">
                      {paymentMethods.map((method) => (
                        <label
                          className={`lux-payment-option ${
                            paymentMethod === method.id ? "is-selected" : ""
                          }`}
                          key={method.id}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={() => setPaymentMethod(method.id)}
                          />
                          <span className="lux-payment-option-copy">
                            <strong>{method.name}</strong>
                            <small>{method.detail}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="lux-checkout-total">
                    <span>Order total</span>
                    <strong>
                      {formatCurrency(grandTotal)}
                    </strong>
                  </div>
                  {checkoutError && (
                    <p className="lux-checkout-error" role="alert">
                      {checkoutError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="lux-checkout-submit"
                    disabled={placingOrder}
                  >
                    {placingOrder
                      ? paymentMethod === "razorpay"
                        ? "Opening Razorpay…"
                        : "Placing order…"
                      : paymentMethod === "razorpay"
                        ? "Continue to Razorpay"
                        : "Place order"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default Cart;
