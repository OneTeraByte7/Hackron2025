import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBoxOpen, FaExclamationTriangle, FaUpload, FaSignOutAlt, FaMapMarkerAlt ,FaDumpster } from "react-icons/fa";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Guest", email: "Not logged in" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-yellowCustom text-black fixed flex flex-col justify-between shadow-lg font-poppins">
      
      {/* 🔹 Logo */}
      <div className="p-6 text-2xl font-bold text-center border-b border-black font-logo tracking-wide">
        Store<span className="text-greenCustom font-logo">Auto</span>
      </div>

      {/* 🔹 User Info */}
      <div className="p-4 text-center border-b border-black">
  <div className="flex items-center justify-center gap-3">
    {/* Avatar */}
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-greenCustom text-white text-xl font-bold">
      {user.name ? user.name[0].toUpperCase() : "?"}
    </div>

    {/* Name */}
    <h3 className="text-lg font-bold">{user.name}</h3>
  </div>

  {/* Email */}
  <p className="text-sm text-gray-700 mt-2">{user.email}</p>
</div>




      {/* 🔹 Navigation */}
      <nav className="flex-grow mt-4">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => navigate("/upload")} 
              className="w-full flex items-center p-3 rounded-l-full hover:bg-greenCustom hover:text-white transition-all duration-300"
            >
              <FaUpload className="mr-3" />
              <span>Upload</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="w-full flex items-center p-3 rounded-l-full hover:bg-greenCustom hover:text-white transition-all duration-300"
            >
              <FaHome className="mr-3" />
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/allphase")} 
              className="w-full flex items-center p-3 rounded-l-full hover:bg-greenCustom hover:text-white transition-all duration-300"
            >
              <FaBoxOpen className="mr-3" />
              <span>Products</span>
            </button>
          </li>
          
          <li>
            <button 
              onClick={() => navigate("/map")} 
              className="w-full flex items-center p-3 rounded-l-full hover:bg-greenCustom hover:text-white transition-all duration-300"
            >
              <FaMapMarkerAlt className="mr-3" />
              <span>Map</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/garbage")} 
              className="w-full flex items-center p-3 rounded-l-full hover:bg-greenCustom hover:text-white transition-all duration-300"
            >
              <FaDumpster className="mr-3" />
              <span>Garbage</span>
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate("/expiry")} 
              className="w-full flex items-center p-3 rounded-l-full hover:bg-greenCustom hover:text-white transition-all duration-300"
            >
              <FaExclamationTriangle className="mr-3" />
              <span>Expiring date</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* 🔹 Logout Button */}
      <div className="p-4 border-t border-black">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
