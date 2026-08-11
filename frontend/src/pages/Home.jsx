import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import UploadBox from "../components/UploadBox";
import Features from "../components/Features";
import Footer from "../components/Footer";
import api from "../services/api";

function AuthModal({ type, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(type === "login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/api/auth/login", { email, password });
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("email", user.email);
        onAuthSuccess({ email: user.email, token: access_token });
      } else {
        await api.post("/api/auth/register", { email, password });
        // Automatically login after register
        const response = await api.post("/api/auth/login", { email, password });
        const { access_token, user } = response.data;
        localStorage.setItem("token", access_token);
        localStorage.setItem("email", user.email);
        onAuthSuccess({ email: user.email, token: access_token });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition text-lg"
        >
          ✕
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Free Account"}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {isLogin
              ? "Sign in to unlock professional RTL schematics"
              : "Get access to metrics, diagrams, and AI reports"}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/20 text-red-300 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-bold transition shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            {isLogin
              ? "Don't have an account? Sign up free"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState("login");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUser({ token, email });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  const handleLoginClick = () => {
    setAuthModalType("login");
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    setAuthModalType("signup");
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />
      <Hero />
      <UploadBox user={user} onUnlockClick={handleLoginClick} />
      <Features />
      <Footer />

      {showAuthModal && (
        <AuthModal
          type={authModalType}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(userData) => setUser(userData)}
        />
      )}
    </div>
  );
}

export default Home;
