import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Register.css";
import Google from "../assets/google.png";
import axios from "axios";
import { API_URL } from "../utils/api";
import Lg from "../assets/wellnest_logo.png";
import loaderGif from "../assets/loader.gif";

// Images
import Img1 from "../assets/Nutrition.jpeg";
import Img2 from "../assets/Clean.jpeg";
import Img3 from "../assets/Healthy.jpeg";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP array
  const [userId, setUserId] = useState(null); // store userId after registration

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpStage, setIsOtpStage] = useState(false); // toggle between Register and OTP form

  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();
  const images = [Img1, Img2, Img3];

  const inputsRef = useRef([]);

  // Auto-change images and check authentication
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [images.length, navigate]);

  // --- Handle Register ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const passwordStrengthRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordStrengthRegex.test(password)) {
      toast.warn(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/v1/api/auth/register`,
        { username, email, password }
      );

      if (response.data.success) {
        toast.success("Account created! Please verify OTP.");
        setUserId(response.data.userId);
        setIsOtpStage(true);
      } else {
        toast.error(response.data.message || "Registration failed.");
      }
    } catch (error) {
      if (error.response?.data?.message === "User already exists") {
        toast.warn("User already exists. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(error.response?.data?.message || "Something went wrong!");
      }
    }

    setIsSubmitting(false);
  };

  // --- Handle OTP Verify ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_URL}/v1/api/auth/verify-otp`,
        { userId, otp: otp.join("") } // send combined OTP
      );

      if (response.data.success) {
        toast.success("OTP verified! Please Login");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.data.message || "OTP verification failed.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "OTP verification failed."
      );
    }

    setIsSubmitting(false);
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0];
    setOtp(newOtp);

    if (index < 5) inputsRef.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // If current field has value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // If current field is empty, go to previous field and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Google registration feature is not available.");
  };

  return (
    <div className="register-container">
      {/* Left Image Section */}
      <motion.div
        className="register-image-section"
        style={{ backgroundImage: `url(${images[currentImage]})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="register-image-text">
          <img src={Lg} alt="WellNest Logo" className="lg" />
          <button className="BackButton" onClick={() => navigate("/")}>
            Back to Website →
          </button>
        </div>
      </motion.div>

      {/* Right Form Section */}
      <div className="register-form-section">
        <div className="register-form">
          {!isOtpStage ? (
            <>
              <h2>Create an account</h2>
              <p>
                Already have an account? <Link to="/login">Log in</Link>
              </p>

              <form onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="terms">
                  <input type="checkbox" id="terms" required />
                  <label htmlFor="terms">
                    I agree to the <a href="#">Terms & Conditions</a>
                  </label>
                </div>

                <motion.button
                  className="create-account-btn"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="register-loading">
                      <img
                        src={loaderGif}
                        alt="Loading..."
                        className="loader-btn"
                      />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create account"
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <>
              <h2
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "28px",
                }}
              >
                Verify OTP
              </h2>
              <p
                style={{
                  color: "white",
                  textAlign: "center",
                  marginTop: "-10px",
                  letterSpacing: "0.5px",
                  fontSize: "18px",
                }}
              >
                Please enter the OTP sent to{" "}
                <b style={{ color: "#04c695", fontSize: "14px" }}>{email}</b>
              </p>

              <form onSubmit={handleVerifyOtp}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    margin: "30px 0",
                  }}
                >
                  {otp.map((value, index) => (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        type="text"
                        maxLength="1"
                        value={value}
                        ref={(el) => (inputsRef.current[index] = el)}
                        onChange={(e) => handleOtpChange(e, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        style={{
                          width: "48px",
                          height: "48px",
                          textAlign: "center",
                          fontSize: "20px",
                          fontWeight: "600",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          backdropFilter: "blur(10px)",
                          boxShadow: value 
                            ? "0 6px 20px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)"
                            : "0 3px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          outline: "none",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          color: value ? "#10b981" : "#6b7280",
                          letterSpacing: "1px",
                          cursor: "pointer",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#10b981";
                          e.target.style.transform = "scale(1.05)";
                          e.target.style.boxShadow = "0 12px 30px rgba(16, 185, 129, 0.25), 0 0 0 3px rgba(16, 185, 129, 0.1)";
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = value ? "#10b981" : "#e5e7eb";
                          e.target.style.transform = "scale(1)";
                          e.target.style.boxShadow = value 
                            ? "0 8px 25px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)"
                            : "0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                        }}
                        onMouseEnter={(e) => {
                          if (document.activeElement !== e.target) {
                            e.target.style.transform = "scale(1.02)";
                            e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (document.activeElement !== e.target) {
                            e.target.style.transform = "scale(1)";
                            e.target.style.boxShadow = value 
                              ? "0 8px 25px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.1)"
                              : "0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
                          }
                        }}
                      />
                      {/* Animated progress indicator */}
                      {value && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "-6px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "100%",
                            height: "3px",
                            background: "linear-gradient(90deg, #10b981, #059669)",
                            borderRadius: "2px",
                            animation: "pulse 2s infinite",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <motion.button
                  className="auth-btn"
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? (
                    <div className="verify-loading">
                      <img
                        src={loaderGif}
                        alt="Loading..."
                        className="loader-btn"
                      />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </motion.button>
              </form>

              <div className="resend-otp">
                Didn’t get the OTP?{" "}
                <button
                  onClick={async () => {
                    try {
                      await axios.post(
                        `${API_URL}/v1/api/auth/resend-otp`,
                        { userId }
                      );
                      toast.success("OTP resent successfully!");
                    } catch (err) {
                      toast.error("Failed to resend OTP.");
                    }
                  }}
                  className="resend-btn"
                >
                  Resend
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full Screen Loader for Registration */}
      {isSubmitting && (
        <div className="fullscreen-loader">
          <div className="loader-content">
            <img src={loaderGif} alt="Processing..." className="loader-large" />
            <p>{userId ? "Verifying OTP..." : "Creating account..."}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
