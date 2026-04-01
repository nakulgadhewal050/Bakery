import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./components/redux/Store";
import App from "./App";
import "./index.css";

// 🔥 AXIOS GLOBAL SETUP
import axios from "axios";

// ✅ AUTO SWITCH BASE URL
// Local → localhost
// Production → Render
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ✅ Allow cookies if ever needed
axios.defaults.withCredentials = true;

// 🔐 AUTO ATTACH TOKEN (ADMIN / USER)
axios.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");
  const authToken = localStorage.getItem("authToken");
  const fallbackToken = localStorage.getItem("token");

  const requestUrl = config.url || "";
  const isAdminApiCall = requestUrl.includes("/api/admin");

  if (isAdminApiCall && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken || authToken || fallbackToken) {
    const resolvedUserToken = userToken || authToken || fallbackToken;
    config.headers.Authorization = `Bearer ${resolvedUserToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  return config;
});

// 🔁 AUTO LOGOUT ON TOKEN EXPIRE
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
