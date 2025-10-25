import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

import Logo from "../assets/wellnest_logo.png";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-wrapper">
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>

        <div className="logo">
          <img src={Logo} alt="WellNest Logo" />
        </div>

        <Link to="/services">Services</Link>
        <Link to="/support">Support</Link>
      </div>

      <div className="Login">
        {isLoggedIn ? (
          <Link to="/dashboard" className="login-btn dashboard-btn">
            Dashboard
          </Link>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
