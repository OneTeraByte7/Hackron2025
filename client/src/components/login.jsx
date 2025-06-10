import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgimg from "../images/bgimg.jpeg";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // Simulate login delay (for example, replace with API call)
    setTimeout(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (storedUser && storedUser.email === email && storedUser.password === password) {
        localStorage.setItem("isAuthenticated", "true");
        setIsAuthenticated?.(true);  // update parent auth state if passed
        alert("✅ Login successful!");
        navigate("/upload");
      } else {
        setError("❌ Invalid email or password.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgimg})` }}
    >
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-96"
        noValidate
      >
        <h1 className="text-2xl font-bold text-center mb-4">🔑 Login</h1>

        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded my-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded my-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
        />

        {error && (
          <p className="text-red-600 text-sm mb-2 text-center">{error}</p>
        )}

        <button
          type="submit"
          className={`w-full bg-greenCustom text-white p-2 rounded hover:bg-green-700 disabled:opacity-60`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-3 text-center text-sm">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
