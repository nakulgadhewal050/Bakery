import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast"; // Add this import

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [animationStage, setAnimationStage] = useState("idle");
  const navigate = useNavigate();

  useEffect(() => {
    if (animationStage === "fading-out") {
      const timer = setTimeout(() => {
        setIsAdminLogin(!isAdminLogin);
        setAnimationStage("fading-in");
      }, 300);

      return () => clearTimeout(timer);
    }

    if (animationStage === "fading-in") {
      const timer = setTimeout(() => {
        setAnimationStage("idle");
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [animationStage, isAdminLogin]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const toggleLoginType = (type) => {
    if (
      (type === "admin" && isAdminLogin) ||
      (type === "user" && !isAdminLogin)
    ) {
      return;
    }

    setAnimationStage("fading-out");
    setForm({ email: "", password: "" });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let response;

      if (isAdminLogin) {
        // Admin login
        response = await api.post("/api/admin/login", {
          email: form.email,
          password: form.password,
        });

        console.log("✅ Admin login response:", response.data);

        // Store only admin token keys to avoid mixing with user checkout auth.
        localStorage.setItem("adminToken", response.data.token);
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userToken");
        sessionStorage.removeItem("authToken");

        localStorage.setItem(
          "adminInfo",
          JSON.stringify({
            id: response.data.admin.id,
            email: response.data.admin.email,
            role: response.data.admin.role,
          })
        );

        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        // User login
        response = await api.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });

        console.log("✅ User login response:", response.data);

        // Ensure admin session keys do not override user-only API calls.
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");

        // Store user tokens
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("token", response.data.token); // This is what OrderNow.jsx looks for
        localStorage.setItem("authToken", response.data.token); // Alternative key

        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            name: response.data.user.name || response.data.user.username,
            phone: response.data.user.phone || "",
          })
        );

        // Also store as 'user' for compatibility
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            name: response.data.user.name || response.data.user.username,
            phone: response.data.user.phone || "",
          })
        );

        console.log("💾 Stored in localStorage:", {
          token: localStorage.getItem("token"),
          userToken: localStorage.getItem("userToken"),
          user: localStorage.getItem("user"),
        });

        toast.success("Login successful!");

        // Check if there's a redirect path (e.g., from OrderNow)
        const fromPath = window.location.state?.from || "/home";
        navigate(fromPath);
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || "Invalid email or password.";
      setMessage(errorMsg);
      toast.error(errorMsg);
      console.error("❌ Login error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    
    <form
      onSubmit={handleSubmit}
      className={`bg-white p-8 rounded-b-2xl shadow-xl border border-gray-200 border-t-0 ${
        animationStage === "fading-out"
          ? "fade-out"
          : animationStage === "fading-in"
          ? "fade-in"
          : ""
      }`}
    >
      <h1 className="text-3xl font-bold text-center text-[#e11d48] mb-2">
        {isAdminLogin ? "Admin Login" : "User Login"}
      </h1>

      <p className="text-center text-[#e11d48] mb-6">
        {isAdminLogin ? "Access the admin dashboard" : "Login to your account"}
      </p>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="font-semibold text-gray-700 block mb-1"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder={isAdminLogin ? "admin@example.com" : "user@example.com"}
          className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none"
        />
      </div>

      {/* Password */}
      <div className="mb-6">
        <label
          htmlFor="password"
          className="font-semibold text-gray-700 block mb-1"
        >
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none"
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
          >
            <i
              className={`text-xl ${
                showPassword ? "bx bx-hide" : "bx bx-show"
              }`}
            ></i>
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading || animationStage !== "idle"}
        className="w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 bg-[#e11d48] hover:bg-[#be123c] text-white"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <i className="bx bx-loader-alt animate-spin text-xl mr-2"></i>
            {isAdminLogin ? "Logging in as Admin..." : "Logging in..."}
          </span>
        ) : isAdminLogin ? (
          "Login as Admin"
        ) : (
          "Login as User"
        )}
      </button>

      {/* Switch Type Hint */}
      <div className="flex justify-between items-center">
        {/* Forgot Password */}

        <div>
          <NavLink
            to={isAdminLogin ? "/admin/forgot-password" : "/forgot-password"}
            className="text-sm font-medium text-[#e11d48] hover:text-[#be123c] hover:underline transition-colors"
          >
            Forgot Password?
          </NavLink>
        </div>

        <button
          type="button"
          onClick={() => toggleLoginType(isAdminLogin ? "user" : "admin")}
          disabled={animationStage !== "idle"}
          className="text-sm text-[#e11d48] hover:text-[#be123c] font-medium transition-colors disabled:opacity-50"
        >
          <i className={`bx bx-${isAdminLogin ? "user" : "crown"} mr-1`}></i>
          Switch to {isAdminLogin ? "User" : "Admin"} Login
        </button>
      </div>

      {isAdminLogin && (
        <div className="text-center mt-4">
          <a
            href="/super-admin/register"
            className="inline-block text-[#e11d48] font-semibold hover:underline hover:text-[#be123c] transition-colors"
          >
            Register for Super Admin
          </a>
        </div>
      )}

      {/* Error Message */}
      {message && (
        <div className="mt-3 p-3 bg-[#fff0f3] border border-pink-200 rounded-lg">
          <p className="text-center text-[#e11d48] font-semibold">
            <i className="bx bx-error-circle mr-2"></i>
            {message}
          </p>
        </div>
      )}

      {/* Debug info (remove in production) */}
      {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
        <p>Debug: Storing token as "token" and "userToken"</p>
      </div> */}
      {!isAdminLogin && (
        <p className="text-center text-sm text-[#e11d48] mt-3">
          Don’t have an account?{" "}
          <NavLink
            to="/register"
            className="text-[#e11d48] font-semibold hover:underline"
          >
            Register
          </NavLink>
        </p>
      )}
    </form>
  );

  const renderLoadingAnimation = () => (
    <div className="bg-white p-8 rounded-b-2xl shadow-xl border border-[#fda4af] border-t-0 flex justify-center items-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#e11d48] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#e11d48] font-medium">
          Switching to {!isAdminLogin ? "Admin" : "User"} login...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-50 to-orange-100 px-4">
      <div className="w-full max-w-md">
        {/* Login Type Toggle */}
        <div className="flex bg-[#fff0f3] rounded-t-2xl overflow-hidden shadow-md">
          <button
            type="button"
            onClick={() => toggleLoginType("user")}
            disabled={animationStage !== "idle"}
            className={`flex-1 py-4 font-semibold transition-all duration-300 disabled:opacity-50 ${
              !isAdminLogin
                ? "bg-[#e11d48] text-white"
                : "bg-[#fff0f3] text-[#e11d48]"
            }`}
          >
            User Login
          </button>
          {/* login */}
           {/* login */}
          <button
            type="button"
            onClick={() => toggleLoginType("admin")}
            disabled={animationStage !== "idle"}
            className={`flex-1 py-4 font-semibold transition-all duration-300 disabled:opacity-50 ${
              isAdminLogin
                ? "bg-[#e11d48] text-white"
                : "bg-[#fff0f3] text-[#e11d48]"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Render appropriate content based on animation stage */}
        {animationStage === "fading-out"
          ? renderLoadingAnimation()
          : renderForm()}
      </div>
    </div>
  );
};

export default Login;