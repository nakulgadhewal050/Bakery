import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";

const SuperAdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    secretKey: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleSecretKeyVisibility = () => {
    setShowSecretKey((prev) => !prev);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await axios.post("/api/admin/super-admin/register", form);

      setMsg(res.data.message);
      toast.success(res.data.message);

      // Small delay before navigation to show success message
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setMsg(errorMsg);
      toast.error(errorMsg);
      console.error(
        "❌ Registration error:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#fff0f3] from-pink-50 to-orange-100 px-4">
      <div className="mt-5 mb-5 w-full max-w-md">
        {/* Header Card */}
        <div className="bg-[#e11d48] text-white p-6 rounded-t-2xl shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-2">
            <i className="bx bx-crown text-4xl mr-2"></i>
            Super Admin Registration
          </h1>
          <p className="text-pink-100">Create a new super admin account</p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={submitHandler}
          className="bg-white p-8 rounded-b-2xl shadow-xl border border-gray-200 border-t-0"
        >
          {/* Name Field */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="font-semibold text-gray-700 block mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none pl-10"
              />
              <i className="bx bx-user absolute left-3 top-3.5 text-gray-400 text-xl"></i>
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="font-semibold text-gray-700 block mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none pl-10"
              />
              <i className="bx bx-envelope absolute left-3 top-3.5 text-gray-400 text-xl"></i>
            </div>
          </div>

          {/* Password Field */}
         
          <div className="mb-4">
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
                placeholder="Create a strong password"
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none pl-10"
              />
              <i className="bx bx-lock-alt absolute left-3 top-3.5 text-gray-400 text-xl"></i>
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

          {/* Secret Key Field */}
          <div className="mb-6">
            <label
              htmlFor="secretKey"
              className="font-semibold text-gray-700 block mb-1"
            >
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                name="secretKey"
                id="secretKey"
                value={form.secretKey}
                onChange={handleChange}
                required
                placeholder="Enter the secret key"
                className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none pl-10"
              />
              <i className="bx bx-key absolute left-3 top-3.5 text-gray-400 text-xl"></i>
              <button
                type="button"
                onClick={toggleSecretKeyVisibility}
                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
              >
                <i
                  className={`text-xl ${
                    showSecretKey ? "bx bx-hide" : "bx bx-show"
                  }`}
                ></i>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contact system administrator for the secret key
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 bg-[#e11d48] hover:bg-[#be123c] text-white"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="bx bx-loader-alt animate-spin text-xl mr-2"></i>
                Registering...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="bx bx-crown text-xl mr-2"></i>
                Register Super Admin
              </span>
            )}
          </button>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            {/* Go to Home Button */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center text-sm font-medium text-[#e11d48] hover:text-[#be123c] transition-colors"
            >
              <i className="bx bx-home text-lg mr-1"></i>
              Go to Home
            </button>

            {/* Back to Login Link */}
            <NavLink
              to="/login"
              className="text-sm font-medium text-[#e11d48] hover:text-[#be123c] hover:underline transition-colors"
            >
              <i className="bx bx-log-in text-lg mr-1"></i>
              Back to Login
            </NavLink>
          </div>

          {/* Message Display */}
          {msg && (
            <div
              className={`mt-3 p-3 rounded-lg border ${
                msg.includes("success") || msg.includes("Success")
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`text-center font-semibold ${
                  msg.includes("success") || msg.includes("Success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                <i
                  className={`bx ${
                    msg.includes("success") || msg.includes("Success")
                      ? "bx-check-circle"
                      : "bx-error-circle"
                  } mr-2`}
                ></i>
                {msg}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-[#fff0f3] border border-pink-200 rounded-lg">
            <h3 className="font-semibold text-[#e11d48] mb-2 flex items-center">
              <i className="bx bx-info-circle mr-2"></i>
              Important Instructions
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-start">
                <i className="bx bx-check text-red-600 mr-1 mt-0.5"></i>
                Super admin has full system access
              </li>
              <li className="flex items-start">
                <i className="bx bx-check text-red-600 mr-1 mt-0.5"></i>
                Keep your credentials secure
              </li>
              <li className="flex items-start">
                <i className="bx bx-check text-red-600 mr-1 mt-0.5"></i>
                Contact system admin for secret key
              </li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminRegister;