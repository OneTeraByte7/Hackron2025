import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState } from "react";
import MainLayout from "./components/mainLayout";
import Dashboard from "./components/dashboard";
import Products from "./components/product";
import Upload from "./components/upload";
import Login from "./components/login";
import Signup from "./components/signup";
import LandingPage from "./components/landingPage";
import WastePredictionChart from './components/ml_model'; 
import MapView from './components/map'; 
import WasteChart from './components/waste'; 
import ExpiryPredictor from './components/shelflife';
import Phase from './components/phase';

function PrivateRoute({ isAuthenticated }) {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return !!localStorage.getItem("isAuthenticated");
  });

  return (
    <Router>
      <Routes>
        {/* 🔹 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔹 Private Routes */}
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<MainLayout />} className="font-poppins">
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/waste" element={<WastePredictionChart />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/garbage" element={<WasteChart />} />
            <Route path="/expiry" element={<ExpiryPredictor />} />
            <Route path="/allphase" element={<Phase />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/product" element={<Products />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
