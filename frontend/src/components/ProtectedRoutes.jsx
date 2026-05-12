import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children, adminOnly = false }) => {
  const userToken =
    localStorage.getItem("userToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("userToken") ||
    sessionStorage.getItem("authToken");

  const genericToken =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const adminToken =
    localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

  // 🔐 ADMIN ROUTES
  if (adminOnly) {
    if (!adminToken) {
      return <Navigate to="/admin-login" replace />;
    }
    return children;
  }

  // 🔐 USER ROUTES
  if (!userToken && !genericToken) {
    // 🔥 ADMIN logged in but accessing user page
    if (adminToken) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
