import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const admin = localStorage.getItem("adminInfo");

  if (!token || !admin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
