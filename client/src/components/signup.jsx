import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgimg from "../images/bgimg.jpeg";

const Signup = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    if (!user.name || !user.email || !user.password) {
      alert("Please fill all fields!");
      return;
    }

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");

    alert("✅ Signup successful!");
    navigate("/upload");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgimg})` }}>
      <div className="p-8 shadow-lg rounded-lg w-96 text-center bg-white">
        <h2 className="text-2xl font-bold text-black mb-4">📝 Sign Up</h2>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={user.name}
          onChange={handleChange}
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          className="w-full p-2 border rounded my-2"
        />
        <button
          onClick={handleSignup}
          className="mt-4 w-full bg-greenCustom text-white py-2 rounded-lg hover:bg-green-700 transition-all"
        >
          Sign Up
        </button>
        <p className="mt-3 text-sm">
          Already have an account? <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
