// src/components/admin/AdminLogin.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("/api/admin/login", {
        email: form.email,
        password: form.password,
      });

      // Save token + admin info
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));

      navigate("/admin/dashboard");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#fff0f3] from-pink-50 to-orange-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
      >
        <h1 className="text-3xl font-bold text-center text-[#c85a32] mb-1">
          Admin Login
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          Only authorized users can access the admin dashboard.
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700 block mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
            placeholder="Enter admin email"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="font-semibold text-gray-700 block mb-1">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dfa26d] outline-none transition"
              placeholder="Enter admin password"
            />

            <i
              className={`absolute right-3 top-3.5 text-xl cursor-pointer text-gray-500 ${
                showPassword ? "bx bx-hide" : "bx bx-show"
              }`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
        </div>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-600 font-semibold mb-3">
            {message}
          </p>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 bg-[#c85a31] hover:bg-[#b34a22] text-white"
        >
          {loading ? "Logging in..." : "Login as Admin"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
