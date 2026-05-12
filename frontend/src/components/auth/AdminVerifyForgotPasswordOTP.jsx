/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AdminVerifyForgotPasswordOTP = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 🔥 ADMIN EMAIL KEY
    const storedEmail = localStorage.getItem("adminFpEmail");

    if (!storedEmail) {
      setMessage(
        "❌ No admin email found. Please restart password reset process."
      );
      navigate("/admin/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      await api.post("/api/admin/verify-otp", {
        email,
        otp,
      });

      // ✅ SUCCESS → RESET PASSWORD
      navigate("/admin/reset-password");
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "❌ OTP verification failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-yellow-100 via-orange-100 to-white">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-2xl border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Admin Verify OTP
        </h1>

        <p className="text-center text-gray-600 mb-4">
          OTP sent to:{" "}
          <span className="font-semibold text-gray-900">{email}</span>
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Enter OTP
            </label>
            <input
              type="number"
              placeholder="Enter the 6-digit OTP"
              required
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 bg-[#c85a31] hover:bg-[#b34a22] text-white"
          >
            Verify OTP
          </button>

          {message && (
            <p className="text-center font-medium text-gray-700 mt-3">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminVerifyForgotPasswordOTP;
