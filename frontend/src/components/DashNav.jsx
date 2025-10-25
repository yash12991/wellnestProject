import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaAppleAlt,
  FaShoppingCart,
  FaFileAlt,
  FaBell,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { SiChatbot } from "react-icons/si";
import { toast } from "react-toastify";
import loaderGif from "../assets/loader.gif";

function DashNav() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call delay for user data
    const fetchUser = setTimeout(() => {
      const userData = localStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
      setLoading(false);
    }, 300);

    return () => clearTimeout(fetchUser);
  }, []);

  const handleLogout = () => {
    setLoggingOut(true);  
    // localStorage.removeItem("mealPlanGenerated");
    // localStorage.removeItem("mealPlanGeneratedDate");
    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("refreshToken");
    // localStorage.removeItem("user");
      // Clear all localStorage on logout to avoid stale flags persisting
    // (keeps logout simple and reliable across tabs/components)
    localStorage.clear();

    // Debug check (will be removed later if not needed)
    // eslint-disable-next-line no-console
    console.debug("post-logout localStorage mealPlanGenerated:", localStorage.getItem("mealPlanGenerated"), "mealPlanGeneratedDate:", localStorage.getItem("mealPlanGeneratedDate"));
  

    toast.success("Logged out successfully!");

    setTimeout(() => {
      setLoggingOut(false);
      navigate("/", { replace: true });
    }, 1000);
  };

  const navItems = [
    { to: "/dashboard", icon: FaHome, label: "Dashboard", exact: true },
    { to: "/meal-plan", icon: FaAppleAlt, label: "Meal Plan" },
    { to: "/dashboard/shop", icon: FaShoppingCart, label: "Ecommerce" },
    { to: "/dashboard/reports", icon: FaFileAlt, label: "Reports & Analytics" },
    { to: "/dashboard/AI", icon: SiChatbot, label: "AI Assistant" },
  ];

  const baseNavItemClasses =
    "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-150 font-normal text-sm";
  const activeNavItemClasses = "bg-black text-white shadow-lg";
  const inactiveNavItemClasses = "text-gray-800 hover:bg-gray-200";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-6 lg:px-10 py-3">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-10">
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              {/* Circular Logo */}
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#ffffff",
                  fontSize: "1.5rem",
                  width: "2.5rem",
                  height: "2.5rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  background: "linear-gradient(135deg, #000000ff, #000000ff)",
                  borderRadius: "35%",
                  // boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                  fontWeight: "700",
                }}
              >
                W
              </div>

              {/* Brand Name */}
              <h1
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: "#111",
                  fontWeight: "600",
                  fontSize: "1.6rem",
                  letterSpacing: "-0.5px",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                WellNest
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact || false} // only exact for dashboard
                    className={({ isActive }) =>
                      `${baseNavItemClasses} ${
                        isActive ? activeNavItemClasses : inactiveNavItemClasses
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right: Icons + User Info + Logout */}
          <div className="flex items-center gap-4">
            {/* Action Icons */}
            <button
              aria-label="Notifications"
              className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-150 border border-gray-300 hidden sm:block"
            >
              <FaBell className="w-4 h-4 text-black" />
            </button>
            <button
              aria-label="Settings"
              onClick={() => navigate("/settings")}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-150 border border-gray-300 hidden sm:block"
            >
              <FaCog className="w-4 h-4 text-black" />
            </button>

            {/* User Profile */}
            {loading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <img src={loaderGif} alt="Loading..." className="w-6 h-6" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 border border-gray-300 rounded-full pr-3 py-1 bg-white">
                  <div className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full font-bold text-sm ml-1 flex-shrink-0">
                    {user?.username
                      ? user.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-sm font-semibold text-black leading-none">
                      {user?.username || "User"}
                    </span>
                    <span className="text-xs text-gray-500 leading-none mt-0.5">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-200 text-black hover:bg-red-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <img
                      src={loaderGif}
                      alt="Logging out..."
                      className="w-4 h-4"
                    />
                  ) : (
                    <FaSignOutAlt className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {loggingOut ? "Signing Out" : "Logout"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation (Scrollable) */}
        <nav className="lg:hidden px-4 pb-3 pt-1 flex gap-2 overflow-x-auto border-t border-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact || false} // exact for dashboard only
                className={({ isActive }) =>
                  `flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold border transition-colors duration-150 ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "text-gray-700 bg-white border-gray-300 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* Spacer to push content down */}
      <div className="h-[76px] lg:h-[68px]"></div>

      {/* Fullscreen logout loader */}
      {loggingOut && (
        <div className="fixed inset-0 bg-white/90 flex items-center justify-center backdrop-blur-sm z-[9999]">
          <div className="flex flex-col items-center gap-4 p-8 bg-white border border-gray-300 rounded-xl shadow-2xl">
            <img src={loaderGif} alt="Logging out..." className="w-12 h-12" />
            <p className="text-xl text-black font-semibold">Logging out...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default DashNav;
