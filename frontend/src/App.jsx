import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  matchPath,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import Services from "./pages/Services";
import Register from "./pages/Register";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard/Dashboard";
import Goals from "./pages/Dashboard/Goals";
import Activity from "./pages/Dashboard/Activity";
import Reports from "./pages/Dashboard/Reports.jsx";
import AIChatbot from "./pages/AIChatbot/AIChatbot";
import MealPlanPage from "./pages/MealPlanPage.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage.jsx";
import MealPlanTable from "./components/MealPlanTable.jsx";
import Support from "./pages/Support";
import Shopping from "./pages/Shopping/Shop";
import Product from "./pages/Shopping/Product";
import Settings from "./pages/Settings";
import Checkout from "./pages/Shopping/Checkout";
import Orders from "./pages/Shopping/Orders";
import OAuthCallback from "./pages/OAuthCallback";

function AppContent() {
  const location = useLocation();

  // List of routes where Navbar should be hidden
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/oauth-callback",
    "/dashboard",
    "/dashboard/goals",
    "/dashboard/activity",
    "/dashboard/reports",
    "/dashboard/ai",
    "/dashboard/shop",
    "/dashboard/shop/cart",
    "/dashboard/shop/product/:id",
    "/meal-plan",
    "/onboarding",
    "/verify-otp",
    "/reset-password",
    "/dashboard/shop/checkout",
    "/dashboard/shop/orders",
    "/settings",
  ];

  // Use matchPath to handle dynamic routes (like /dashboard/shop/product/5)
  const showNavbar = !hideNavbarRoutes.some((route) =>
    matchPath({ path: route, end: true }, location.pathname)
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/support" element={<Support />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/activity"
          element={
            <ProtectedRoute>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ai"
          element={
            <ProtectedRoute>
              <AIChatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal-plan"
          element={
            <ProtectedRoute>
              <MealPlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mealplans"
          element={
            <ProtectedRoute>
              <MealPlanTable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* 🛍️ Shopping routes */}
        <Route
          path="/dashboard/shop"
          element={
            <ProtectedRoute>
              <Shopping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/shop/product/:id"
          element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/shop/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/shop/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
