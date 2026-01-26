import React from "react";
import { FaRocket, FaShieldAlt, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgimg1 from "../images/bgimg1.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen font-body">
      {/* Navbar */}
      <header className="w-full absolute top-0 left-0 z-30">
        <div className="site-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/') }>
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-logo">SA</div>
            <span className="text-white font-logo text-xl drop-shadow">StoreAuto</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-white text-sm">
            <button onClick={() => navigate('/login')} className="px-4 py-2 btn-outline rounded-md">Login</button>
            <button onClick={() => navigate('/signup')} className="px-4 py-2 btn-primary rounded-md">Sign up</button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="hero h-screen flex items-center"
        style={{ backgroundImage: `url(${bgimg1})` }}
        aria-label="Hero"
      >
        <div className="hero-overlay"></div>
        <div className="site-container relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 font-logo leading-tight">Smarter Inventory. Faster Decisions.</h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">StoreAuto helps retail teams reduce waste, improve shelf life tracking, and automate inventory insights with simple integrations.</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/signup')} className="px-6 py-3 rounded-lg btn-primary font-semibold">Get started — it's free</button>
              <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-lg btn-outline font-semibold">See a demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white text-center">
        <div className="site-container">
          <h2 className="text-3xl font-bold mb-8">Why teams choose StoreAuto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 feature-card">
              <FaRocket size={44} className="text-green-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
              <p className="text-sm text-gray-600">Real-time sync and speedy processing — get answers when you need them.</p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 feature-card">
              <FaShieldAlt size={44} className="text-green-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Secure & Compliant</h3>
              <p className="text-sm text-gray-600">Role-based access control and encrypted storage keep data safe.</p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-b from-white to-gray-50 feature-card">
              <FaUsers size={44} className="text-green-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Built for Teams</h3>
              <p className="text-sm text-gray-600">Easy onboarding, clear permissions, and collaborative workflows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-500 text-white text-center">
        <div className="site-container">
          <h3 className="text-2xl font-bold mb-3">Ready to reduce waste and improve margins?</h3>
          <p className="text-sm text-white/90 mb-6">Try StoreAuto for free — or schedule a quick walkthrough with our team.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate('/signup')} className="px-6 py-3 btn-primary rounded-md">Start free trial</button>
            <button onClick={() => navigate('/login')} className="px-6 py-3 btn-outline rounded-md">Contact sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="site-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-logo">SA</div>
            <div>
              <div className="font-semibold">StoreAuto</div>
              <div className="text-sm text-gray-400">© {new Date().getFullYear()} StoreAuto</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <div>Made with care — track inventory, reduce waste.</div>
            <div className="mt-1">Product Owner: <span className="font-semibold">Soham J Suryawanshi</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
