
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import { API_URL } from "../../api.js";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (isSignup && password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup ? "register" : "login";

      const payload = isSignup
        ? {
            fullName: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      if (isSignup) {
        setMessage("Account created successfully! Please sign in.");
        setIsSignup(false);
        setPassword("");
      } else {
        // Store the short-lived token for subsequent authenticated requests.
        sessionStorage.setItem("arveToken", data.token);
        sessionStorage.setItem("arveUser", JSON.stringify(data.user));

        setMessage("Login successful! Redirecting...");

        navigate(data.user.role === "admin" ? "/admin" : "/");
      }
    } catch (error) {
      setMessage(
        error instanceof TypeError
          ? "Unable to reach the furniture API. Start the backend and confirm MongoDB is connected. If you use Atlas, allow this machine's IP in Network Access."
          : error.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <section className="login-card">
          <Link to="/" className="login-brand">
            ARVÉ<span>.</span>
          </Link>

          <p className="login-eyebrow">WELCOME TO ARVÉ</p>

          <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>

          <p className="login-description">
            {isSignup
              ? "Join us and discover beautiful living."
              : "Sign in to continue your shopping journey."}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="login-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>

              <div className="login-password">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="login-forgot">
                <button
                  type="button"
                  onClick={() =>
                    setMessage("Password recovery is not connected yet.")
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}

            {message && (
              <p className="login-message" role="status" aria-live="polite">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}

              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="login-switch">
            {isSignup ? "Already have an account?" : "New to ARVÉ?"}{" "}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setIsSignup(!isSignup);
                setMessage("");
                setPassword("");
              }}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>

          <Link to="/" className="login-home">
            ← Back to homepage
          </Link>
        </section>
      </main>
    </>
  );
};

export default Login;
