import {
  Boxes,
  Home,
  ShoppingBag,
  Menu,
  ChevronLeft,
  User2,
  Users2,
} from "lucide-react";
import React, { useState } from "react";

import logo from "../../assets/homePage/logo-Black.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SideBar = ({ closeSidebar }) => {
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  const adminRole = adminInfo?.role;

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", icon: <Home size={22} />, path: "/admin/dashboard" },
    { name: "Orders", icon: <ShoppingBag size={22} />, path: "/admin/orders" },
    { name: "Products", icon: <Boxes size={22} />, path: "/admin/products" },

    ...(adminRole === "super-admin"
      ? [
          {
            name: "Create Admin",
            icon: <User2 size={22} />,
            path: "/admin/create-admin",
          },
          {
            name: "All Admins",
            icon: <Users2 size={22} />,
            path: "/admin/all-admins",
          },
        ]
      : []),

    { name: "All Users", icon: <Users2 size={22} />, path: "/admin/all-users" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleClose = () => {
    setMobileOpen(false);
    if (closeSidebar) closeSidebar();
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/");
  };

  return (
    <>
      {/* MOBILE BUTTON */}
      {!closeSidebar && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-[#e11d48] text-white p-2.5 rounded-lg shadow-md hover:bg-[#be123c] transition"
        >
          <Menu size={24} />
        </button>
      )}

      {/* BACKDROP */}
      {(mobileOpen || closeSidebar) && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 sm:w-64 bg-[#fff0f3] shadow-xl z-50 transform transition-transform duration-300 flex flex-col ${
          mobileOpen || closeSidebar
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-pink-200">
          <img src={logo} alt="Logo" className="h-10" />

          <button
            onClick={handleClose}
            className="lg:hidden p-2 rounded hover:bg-pink-100"
          >
            <ChevronLeft size={24} className="text-[#e11d48]" />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 mt-4 px-2 space-y-1">
          {menus.map((m) => (
            <Link
              key={m.name}
              to={m.path}
              onClick={handleClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                isActive(m.path)
                  ? "bg-[#e11d48] text-white shadow-md"
                  : "text-[#e11d48] hover:bg-pink-100"
              }`}
            >
              {m.icon}
              {m.name}
            </Link>
          ))}
        </nav>

        {/* ACTION BUTTONS */}
        <div className="px-4 mt-4 space-y-2">
          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-[#e11d48] bg-white border border-[#e11d48] hover:bg-pink-50"
          >
            <Home size={20} />
            Go to Home
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-[#e11d48] hover:bg-[#be123c]"
          >
            Logout
          </button>
        </div>

        {/* FOOTER */}
        <div className="mt-auto p-4 border-t border-pink-200 text-center text-sm text-black">
          © Graphura India Pvt. Ltd.
        </div>
      </aside>
    </>
  );
};

export default SideBar;