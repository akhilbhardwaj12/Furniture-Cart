
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    // Frontend demonstration only; connect a newsletter service to store emails.
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="lux-footer" id="about">
      <div className="lux-footer-main">
        <div className="lux-footer-brand">
          <Link to="/" className="lux-footer-logo">
            <span className="lux-footer-mark">A.</span>
            <span>
              <strong>ARVÉ</strong>
              <small>FURNITURE & LIVING</small>
            </span>
          </Link>

          <p>
            Thoughtfully chosen furniture for spaces that feel
            personal, timeless, and beautifully lived in.
          </p>

          <div className="lux-footer-socials">
            <a href="https://instagram.com/" target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
            <a href="https://pinterest.com/" target="_blank" rel="noreferrer">
              Pinterest ↗
            </a>
          </div>
        </div>

        <div className="lux-footer-column">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/#collections">Collections</Link>
          <Link to="/#featured">Featured products</Link>
          <Link to="/cart">Shopping bag</Link>
        </div>

        <div className="lux-footer-column">
          <h3>Customer care</h3>
          <a href="mailto:hello@example.com">Contact us</a>
          <a href="mailto:hello@example.com?subject=Delivery%20enquiry">
            Delivery enquiries
          </a>
          <a href="mailto:hello@example.com?subject=Returns%20enquiry">
            Returns enquiries
          </a>
        </div>

        <div className="lux-footer-newsletter">
          <span className="lux-footer-eyebrow">A NOTE FROM US</span>
          <h3>A little inspiration<br />for your home.</h3>
          <p>
            Join our list for design inspiration and collection updates.
          </p>

          {subscribed ? (
            <p className="lux-footer-success" role="status">
              Thank you! Your demo subscription is complete.
            </p>
          ) : (
            <form
              className="lux-footer-form"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-label="Your email address"
                required
              />
              <button type="submit" aria-label="Subscribe">
                →
              </button>
            </form>
          )}

          <small className="lux-footer-privacy">
            By subscribing, you agree to receive occasional updates.
          </small>
        </div>
      </div>

      <div className="lux-footer-bottom">
        <span>© {new Date().getFullYear()} ARVÉ Furniture & Living</span>
        <span>Considered design. Everyday living.</span>
        <a href="#top" onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}>
          Back to top ↑
        </a>
      </div>
    </footer>
  );
};

export default Footer;
