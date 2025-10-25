import React from "react";
import "./FooterSupport.css";
import WellNest from "../assets/wellnest_logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

function FooterSupport() {
  return (
    <footer className="footer-support">
      <div className="FooterSupport-Box">
        <div className="footer-support-container">
          {/* Left section */}
          <div className="footer-support-left">
            <img
              className="footer-support-logo"
              src={WellNest}
              alt="WellNest Logo"
            />
            <p className="footer-support-desc">
              WellNest empowers communities to embrace wellness and growth —
              making healthy living easier to share, understand, and act on.
            </p>
            <div className="footer-support-socials">
              <a href="#">
                <FaFacebookF />
              </a>
              <a href="#">
                <FaInstagram />
              </a>
              <a href="#">
                <FaLinkedinIn />
              </a>
              <a href="#">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Right section */}
          <div className="footer-support-links">
            <div>
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#">Features</a>
                </li>
                <li>
                  <a href="#pricing-section">Pricing</a>
                </li>
                <li>
                  <a href="#">Integrations</a>
                </li>
                <li>
                  <a href="#">Changelog</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="#">Documentation</a>
                </li>
                <li>
                  <a href="#">Tutorials</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Support</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
                <li>
                  <a href="#">Partners</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-support-bottom">
          <p>&copy; 2025 WellNest. All rights reserved.</p>
          <div className="footer-support-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSupport;
