import React, { useState } from "react";
import api from "../../api/axios";
import { useNavigate, NavLink } from "react-router-dom";
import "boxicons/css/boxicons.min.css";
import { toast } from "react-hot-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      toast.error("All fields are required");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/register", formData);

      toast.success("OTP sent to your email!");
      localStorage.setItem("userInfo", JSON.stringify(formData));
      navigate("/verify-otp");
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed";
      toast.error(msg);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#fff0f3] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center text-[#e11d48] mb-6">
          Create Account
        </h1>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none"
            placeholder="Enter full name"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none"
            placeholder="example@mail.com"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Phone Number
          </label>
          <input
            type="number"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none"
            placeholder="10-digit phone number"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-[#e11d48] focus:ring-2 focus:ring-[#be123c] outline-none"
              placeholder="Enter password"
            />
            <i
              className={`bx ${
                showPassword ? "bx-hide" : "bx-show"
              } absolute right-3 top-3.5 text-xl text-gray-600 cursor-pointer`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 bg-[#e11d48] hover:bg-[#be123c] text-white"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Registering...
            </div>
          ) : (
            "Sign Up"
          )}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-[#e11d48] mt-4">
          Already have an account?{" "}
          <NavLink
            to="/login"
            className="text-[#e11d48] font-semibold hover:underline"
          >
            Login here
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Register;