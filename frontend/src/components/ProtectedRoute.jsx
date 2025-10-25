import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const user = localStorage.getItem("user");
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
