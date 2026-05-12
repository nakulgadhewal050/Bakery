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
// If env is not set, use same-origin and rely on Vite proxy (dev) / rewrite (prod).
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";

// ✅ Allow cookies if ever needed
axios.defaults.withCredentials = true;

// 🔐 AUTO ATTACH TOKEN (ADMIN / USER)
// Check all possible token storage keys for compatibility
axios.interceptors.request.use((config) => {
  const token = 
    localStorage.getItem("token") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔁 AUTO LOGOUT ON TOKEN EXPIRE
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    // Let pages decide how to handle auth failures; do not force global redirect on any 401.
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
