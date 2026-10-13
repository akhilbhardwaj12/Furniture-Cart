
import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../ShopContext/ShopContext.jsx";
import "./Navbar.css";

const Navbar = () => {
  const { itemAmount } = useContext(ShopContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem("arveUser");
    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Unable to read the saved user session:", error);
      return null;
    }
  });

  const closeMenu = () => setMenuOpen(false);
  const signOut = () => {
    sessionStorage.removeItem("arveToken");
    sessionStorage.removeItem("arveUser");
    setUser(null);
    closeMenu();
  };

  return (
    <>
      <div className="announcement-bar">
        Thoughtfully designed furniture for beautiful living.
      </div>

      <header className="lux-navbar">
        <div className="lux-navbar-inner">
          <Link to="/" className="lux-brand" onClick={closeMenu}>
            <span className="lux-brand-mark">A.</span>
            <span className="lux-brand-text">
              <strong>ARVÉ</strong>
              <small>FURNITURE &amp; LIVING</small>
            </span>
          </Link>

          <button
            className="lux-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>

          <nav className={`lux-nav-links ${menuOpen ? "is-open" : ""}`}>
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>

            <a href="/#collections" onClick={closeMenu}>
              Collections
            </a>

            <a href="/#featured" onClick={closeMenu}>
              Featured
            </a>

            <a href="/#about" onClick={closeMenu}>
              Our Story
            </a>
          </nav>

          <div className="lux-nav-actions">
            {user?.role === "admin" && (
              <Link to="/admin" className="login-nav-link" onClick={closeMenu}>
                Admin
              </Link>
            )}

            {user ? (
              <button
                type="button"
                className="login-nav-link lux-sign-out"
                onClick={signOut}
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                className="login-nav-link"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}

            <Link
              to="/cart"
              className="lux-cart-link"
              aria-label={`Shopping cart, ${itemAmount} items`}
              onClick={closeMenu}
            >
              <svg
                viewBox="0 0 24 24"
                width="23"
                height="23"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3h2l2.4 11.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 1.9-1.5L22 7H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="19" cy="20" r="1" />
              </svg>

              <span className="lux-cart-label">Bag</span>
              <span className="lux-cart-count">{itemAmount}</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
