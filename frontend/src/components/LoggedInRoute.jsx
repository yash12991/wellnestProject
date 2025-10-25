import React from "react";
import { Navigate } from "react-router-dom";

function LoggedInRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user"));
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default LoggedInRoute;
