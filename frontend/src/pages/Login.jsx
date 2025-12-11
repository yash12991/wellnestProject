import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Login.css";
import Google from "../assets/google.png";
import axios from "axios";
import { API_URL } from "../utils/api";
import Lg from "../assets/wellnest_logo.png";
import loaderGif from "../assets/loader.gif";

import Img1 from "../assets/Healthy.jpeg";
import Img2 from "../assets/Clean.jpeg";
import Img3 from "../assets/Nutrition.jpeg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  const images = [Img1, Img2, Img3];

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (token && user) {
      const parsedUser = JSON.parse(user);
      if (!parsedUser.isOnboardingComplete) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      return;
    }

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [images.length, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
  `${API_URL}/v1/api/auth/login`,
        { email, password }
      );

      if (response.data.success) {
        // Always save tokens first
        if (response.data.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
        }
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // Check if onboarding is required
        if (response.data.requiresOnboarding) {
          toast.info("Please complete your onboarding!");
          setTimeout(() => {
            navigate("/onboarding", { 
              replace: true,
              state: { userId: response.data.userId, email: response.data.email }
            });
          }, 1500);
          setIsSubmitting(false);
          return;
        }

        // Normal login flow with user data
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful!");

        // Redirect based on onboarding status
        setTimeout(() => {
          if (!user.isOnboardingComplete) {
            navigate("/onboarding", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 1500);
      } else {
        toast.error(response.data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.message === "User not found") {
        toast.warn("No account found. Redirecting to register");
        setTimeout(() => navigate("/register"), 2000);
      } else {
        toast.error(error.response?.data?.message || "Something went wrong!");
      }
    }

    setIsSubmitting(false);
  };

  // Forgot password modal state & handlers
  const [showForgot, setShowForgot] = useState(false);
  const [fpEmail, setFpEmail] = useState("");
  const [fpStage, setFpStage] = useState(0); // 0 = request OTP, 1 = verify OTP + reset
  const [fpOTP, setFpOTP] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const requestOTP = async () => {
    if (!fpEmail) return toast.error("Please enter your email");
    setFpLoading(true);
    try {
      const res = await axios.post(`${API_URL}/v1/api/auth/forgot-password`, { email: fpEmail });
      if (res.data.success) {
        toast.success("If an account exists for this email, an OTP has been sent");
        setFpStage(1);
      } else {
        toast.error(res.data.message || "Failed to request OTP");
      }
    } catch (err) {
      console.error('Password reset request failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to request OTP. Please try again.");
      // Log the complete error for debugging
      console.log('Complete error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      });
    } finally {
      setFpLoading(false);
    }
  };

  const submitReset = async () => {
    if (!fpEmail || !fpOTP || !fpNewPassword) return toast.error("Please fill all fields");
    if (fpNewPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setFpLoading(true);
    try {
      const res = await axios.post(`${API_URL}/v1/api/auth/reset-password`, {
        email: fpEmail,
        otp: fpOTP,
        newPassword: fpNewPassword,
      });
      if (res.data.success) {
        toast.success("Password reset successful. Please login with your new password.");
        setShowForgot(false);
        setFpStage(0);
        setFpEmail("");
        setFpOTP("");
        setFpNewPassword("");
      } else {
        toast.error(res.data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error('Password reset verification failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to reset password. Please try again.");
      // Log the complete error for debugging
      console.log('Complete error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method
        }
      });
    } finally {
      setFpLoading(false);
    }
  };



  return (
    <>
    <div className="login-container">
      {/* Left Section with image slideshow */}
      <motion.div
        className="login-image-section"
        style={{ backgroundImage: `url(${images[currentImage]})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="login-image-text">
          <img src={Lg} alt="WellNest Logo" className="lg" />
          <button className="BackButton" onClick={() => navigate("/")}>
            Back to Website →
          </button>
        </div>
      </motion.div>

      {/* Right Section (Form) */}
      <div className="login-form-section">
        <div className="login-form">
          <h2>Log in</h2>
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <motion.button
              className="create-account-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="login-loading">
                  <img
                    src={loaderGif}
                    alt="Loading..."
                    className="loader-btn"
                  />
                  <span>Logging in...</span>
                </div>
              ) : (
                "Log in"
              )}
            </motion.button>
          </form>

          <div className="or-divider">
            <span>OR</span>
          </div>

          <button
            className="google-login-btn"
            onClick={() => {
              window.location.href = `${API_URL}/v1/api/oauth/google`;
            }}
            type="button"
          >
            <img src={Google} alt="Google" className="google-icon" />
            Continue with Google
          </button>
          <div style={{ marginTop: 12, textAlign: 'right' }}>
            <button className="link-button" onClick={() => setShowForgot(true)}>
              Forgot password?
            </button>
          </div>
        </div>
      </div>
      
      {isSubmitting && (
        <div className="fullscreen-loader">
          <div className="loader-content">
            <img src={loaderGif} alt="Logging in..." className="loader-large" />
            <p>Logging in...</p>
          </div>
        </div>
      )}
    </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Forgot Password</h3>
            {fpStage === 0 ? (
              <>
                <p>Enter your email to receive an OTP to reset your password.</p>
                <input type="email" placeholder="Email" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => setShowForgot(false)} className="btn-secondary">Cancel</button>
                  <button onClick={requestOTP} className="btn-primary" disabled={fpLoading}>{fpLoading ? 'Sending...' : 'Send OTP'}</button>
                </div>
              </>
            ) : (
              <>
                <p>Enter the OTP sent to your email and your new password.</p>
                <input type="text" placeholder="OTP" value={fpOTP} onChange={(e) => setFpOTP(e.target.value)} />
                <input type="password" placeholder="New password" value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} />
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => { setFpStage(0); setFpOTP(''); setFpNewPassword(''); }} className="btn-secondary">Back</button>
                  <button onClick={submitReset} className="btn-primary" disabled={fpLoading}>{fpLoading ? 'Resetting...' : 'Reset Password'}</button>
                </div>
              </>
            )}
          </div>
        </div>
    )}
    </>
  );
}

export default Login;
