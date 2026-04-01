import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaMapMarkerAlt,
  FaArrowRight,
  FaPaperPlane,
  FaPhone,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assets/homePage/logo-White.png";

const Footer = () => {
  const [email, setEmail] = useState("");

  const services = [
  { label: "Birthday Cakes", category: "Birthday Cakes" },
  { label: "Wedding Cakes", category: "Classic Cakes" },
  { label: "Pastries", category: "Pastries" },
  { label: "Rolls", category: "Rolls" },
  { label: "Premium Cakes", category: "Premium Cakes" },
];

  const handleSubscribe = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      // 🔹 Replace with your backend URL
      const res = await fetch("http://localhost:5000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Subscribed successfully!");
        setEmail("");
      } else {
        alert(data.message || "Subscription failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <footer className="bg-[#1a1a1a] pt-20 pb-0 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">

        {/* LOGO + ABOUT */}
        <div className="space-y-6">
          <img src={logo} alt="Dakingo Bakery" className="h-14 mb-2" />

          <p className="text-sm text-gray-400 leading-relaxed">
            Freshly baked happiness every day — Cakes, pastries, cookies & more.
            Made with love for every celebration!
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="bg-[#e11d48] p-3 rounded-full group-hover:scale-110 transition-transform">
                <FaEnvelope className="text-white text-xs" />
              </div>
              <p className="text-sm text-gray-300">
                Email us <br />
                <a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=official@graphura.in"
  target="_blank"
  rel="noopener noreferrer"
  className="font-bold text-white hover:text-[#e11d48] transition-colors"
>
  official@graphura.in
</a>
              </p>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="bg-[#e11d48] p-3 rounded-full group-hover:scale-110 transition-transform">
                <FaPhone className="text-white text-xs" />
              </div>
              <p className="text-sm text-gray-300">
                Phone <br />
                <span className="font-bold text-white">7378021327</span>
              </p>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-bold text-white mb-8 relative inline-block">
            Quick Links
            <span className="absolute -bottom-2 left-0 w-10 h-1 bg-[#e11d48]"></span>
          </h3>

          <ul className="space-y-4 text-gray-400">
            {[
              { path: "/home", label: "Home" },
              { path: "/menu", label: "Menu" },
              { path: "/customize", label: "Custom Cake" },
              { path: "/about", label: "About Us" },
              { path: "/contact-us", label: "Contact" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="flex items-center gap-2 hover:text-[#e11d48] transition-colors group"
                >
                  <FaArrowRight
                    size={10}
                    className="text-[#e11d48] opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0"
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SERVICES */}
        <div>
          <h3 className="text-lg font-bold text-white mb-8 relative inline-block">
            Our Services
            <span className="absolute -bottom-2 left-0 w-10 h-1 bg-[#e11d48]"></span>
          </h3>

          <ul className="space-y-4 text-gray-400">
            {services.map((service) => (
              <li key={service.category}>
                <Link
                  to={`/menu?category=${encodeURIComponent(service.category)}`}
                  className="flex items-center gap-2 hover:text-[#e11d48] transition-colors group"
                >
                  <FaArrowRight
                    size={10}
                    className="text-[#e11d48] opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0"
                  />
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div>
          <h3 className="text-lg font-bold text-white mb-8 relative inline-block">
            Newsletter
            <span className="absolute -bottom-2 left-0 w-10 h-1 bg-[#e11d48]"></span>
          </h3>

          <p className="text-sm text-gray-400 mb-6">
            Get exclusive offers, bakery updates, and festive cake combos!
          </p>

          {/* CLEAN INPUT */}
         <div className="flex items-center bg-[#2a2a2a] rounded-full px-4 py-2 border border-gray-600 focus-within:border-[#e11d48] transition-all">
            
          <input
  type="email"
  placeholder="Your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  autoComplete="off"
  className="flex-grow bg-transparent text-sm text-white placeholder-gray-400 border-none outline-none focus:outline-none focus:ring-0 appearance-none"
/>

            <button
              onClick={handleSubscribe}
              className="ml-2 bg-[#e11d48] hover:bg-[#be123c] p-2 rounded-full text-white transition-all flex items-center justify-center"
            >
              <FaPaperPlane size={12} />
            </button>
          </div>

          {/* SOCIAL */}
          <div className="flex gap-4 mt-8">
            {[
  {
    icon: FaLinkedin,
    path: "https://www.linkedin.com/company/graphura-india-private-limited/",
  },
  {
    icon: FaInstagram,
    path: "https://instagram.com/graphura.in",
  },
  {
    icon: FaFacebook,
    path: "https://facebook.com/graphura.in",
  },
  {
    icon: FaXTwitter,
    path: "https://x.com/Graphura",
  },
  {
    icon: FaMapMarkerAlt,
    path: "https://www.google.com/maps/dir//Graphura+India+Private+Limited,+near+Renu+Sharma+Foundation,+Pataudi,+Gurgaon,+Haryana+122503/",
  },
].map((item, index) => {
  const Icon = item.icon;

  return (
    <a
      key={index}
      href={item.path}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a2a2a] text-gray-400 hover:bg-[#e11d48] hover:text-white transition-all"
    >
      <Icon size={18} />
    </a>
  );
})}
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="py-6 border-t border-white/5 bg-black/20">
        <p className="text-center text-xs text-gray-500 tracking-wider">
          © 2026{" "}
          <span className="text-white font-bold">
            GRAPHURA INDIA PRIVATE LIMITED
          </span>{" "}
          — HANDCRAFTED WITH LOVE
        </p>
      </div>
    </footer>
  );
};

export default Footer;