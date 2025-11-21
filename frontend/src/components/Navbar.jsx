import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

import Logo from "../assets/wellnest_logo.png";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo - Always visible */}
        <div className="logo-mobile">
          <Link to="/" onClick={closeMenu}>
            <img src={Logo} alt="WellNest Logo" />
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-wrapper ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/about" onClick={closeMenu}>About Us</Link>

          <div className="logo logo-desktop">
            <img src={Logo} alt="WellNest Logo" />
          </div>

          <Link to="/services" onClick={closeMenu}>Services</Link>
          <Link to="/support" onClick={closeMenu}>Support</Link>

          {/* Login button inside menu on mobile */}
          <div className="mobile-login">
            {isLoggedIn ? (
              <Link to="/dashboard" className="login-btn dashboard-btn" onClick={closeMenu}>
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="login-btn" onClick={closeMenu}>
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Login Button */}
        <div className="Login desktop-login">
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
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </nav>
  );
}

export default Navbar;
