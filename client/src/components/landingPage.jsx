import React from "react";
import { FaRocket, FaShieldAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgimg1 from "../images/bgimg1.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen">
      {/* 🔹 Hero Section */}
      <div 
        className="relative h-screen flex flex-col justify-center items-center text-white text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgimg1})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <h1 
          className="text-7xl font-extrabold drop-shadow-lg mb-4 relative"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          Welcome to <span className="text-yellow-400 tracking-wide">Store<span className="text-greenCustom ">Auto</span></span>
        </h1>

        <p className="text-lg md:text-xl max-w-3xl mb-6 opacity-90 relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Effortlessly manage your inventory, track products, and stay ahead with real-time insights.
        </p>

        {/* Call-to-Action Buttons */}
        <div className="flex gap-4 mt-4 relative">
          <button 
            onClick={() => navigate("/signup")} 
            className="px-6 py-3 bg-green-500 hover:bg-green-700 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-300"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate("/login")} 
            className="px-6 py-3 bg-transparent border border-white hover:bg-white hover:text-black text-lg font-semibold rounded-lg transition-all duration-300"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Login
          </button>
        </div>
      </div>

      {/* 🔹 Features Section */}
      <div className="py-20 px-6 bg-white text-black text-center">
        <h2 className="text-3xl font-bold mb-10" style={{ fontFamily: "'Poppins', sans-serif" }}>Why Choose <span className="text-yellowCustom font-logo tracking-wide">Store<span className="text-greenCustom">Auto</span></span>?</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="p-6 bg-yellow-100 rounded-lg shadow-lg hover:shadow-2xl transition-all">
            <FaRocket size={40} className="text-green-600 mb-3 mx-auto" />
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Fast & Reliable</h3>
            <p>Experience lightning-fast product tracking and seamless management.</p>
          </div>
          <div className="p-6 bg-yellow-100 rounded-lg shadow-lg hover:shadow-2xl transition-all">
            <FaShieldAlt size={40} className="text-green-600 mb-3 mx-auto" />
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Secure & Safe</h3>
            <p>We ensure your data is protected with top-notch security measures.</p>
          </div>
          <div className="p-6 bg-yellow-100 rounded-lg shadow-lg hover:shadow-2xl transition-all">
            <FaUsers size={40} className="text-green-600 mb-3 mx-auto" />
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>User-Friendly</h3>
            <p>Simple & intuitive design makes inventory management effortless.</p>
          </div>
        </div>
      </div>

      {/* 🔹 Call-To-Action (CTA) */}
      <div className="py-16 bg-green-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Ready to Get Started?</h2>
        <p className="text-lg mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Join us today and take your inventory management to the next level!</p>
        <button 
          onClick={() => navigate("/signup")} 
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white text-lg font-semibold rounded-lg shadow-lg transition-all duration-300"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Sign Up Now
        </button>
      </div>

      {/* 🔹 Footer */}
      <footer className="py-6 text-center bg-gray-900 text-white">
        <p className="text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>© {new Date().getFullYear()} StoreAuto. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
