import React, { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/api/auth/forgot-password", { email });

      localStorage.setItem("fpEmail", email);
      setMessage(res.data.message);

      navigate("/otp-verify");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#fff0f3]">
      
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center text-sm font-medium text-[#e11d48] hover:text-[#be123c] transition-colors"
        >
          <i className="bx bx-home text-[#e11d48] text-lg mr-1"></i>
          Back to Home
        </button>

        <h1 className="text-3xl font-bold text-center mt-2 text-[#e11d48] mb-6">
          Forgot Password
        </h1>

        <p className="text-center text-[#e11d48] mb-4">
          Enter your registered email to receive an OTP.
        </p>

        <form onSubmit={sendOtp} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#e11d48] rounded-lg 
              focus:ring-2 focus:ring-[#be123c] outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full font-semibold py-3 rounded-lg shadow-md transition-all duration-300 disabled:opacity-60 mb-3 bg-[#e11d48] hover:bg-[#be123c] text-white"
          >
            Send OTP
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="text-center font-medium mt-4 text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgetPassword;