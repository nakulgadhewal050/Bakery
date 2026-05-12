import React, { useState } from "react";
import api from "../../api/axios";

export default function LogoutButton() {
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      // Remove everything
      localStorage.removeItem("userToken");
      localStorage.removeItem("userInfo");

      // 🔥 Trigger navbar update in same tab
      window.dispatchEvent(new Event("storage"));

      // OPTIONAL redirect
      window.location.href = "/login";

      setMessage("Logged out successfully");
    } catch (error) {
      console.error("Logout Error:", error);
      setMessage("Logout failed!");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-10">
      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
      >
        Logout
      </button>

      {message && <p className="text-green-600 font-semibold">{message}</p>}
    </div>
  );
}
