import { useState } from "react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
import api from "../api/axios";

function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    if (!form.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!form.message.trim()) {
      setError("Please enter your message");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("Message must be at least 10 characters long");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/contact/contact-us", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      if (!data || !data.success) {
        throw new Error(data?.message || "Something went wrong");
      }

      setSuccess(data.message || "Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send message. Please try again later.";
      setError(errorMessage);
      console.error("Contact form error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#fff1f5] to-white min-h-screen relative">

      {/* Background shapes */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-[#e11d48]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-52 h-52 bg-[#e11d48]/20 rounded-full blur-3xl"></div>

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-14 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#e11d48] mb-4">
          Contact Our Bakery 🍰
        </h1>
        <p className="text-gray-600 text-lg">
          Have a cake in mind? Want to place a custom order?  
          Send us a message and we’ll bake something delicious for you.
        </p>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 relative z-10">

        {/* FORM */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#ffe4ea]">

          <h2 className="text-2xl font-semibold text-[#e11d48] mb-6">
            Send Us a Message
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <span>❌</span> {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm flex items-center gap-2">
                <span>✅</span> {success}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-xl !border-2 !border-gray-600 !bg-white !text-black placeholder-gray-400 focus:!border-[#e11d48] focus:!ring-2 focus:!ring-[#e11d48]/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-xl !border-2 !border-gray-600 !bg-white !text-black placeholder-gray-400 focus:!border-[#e11d48] focus:!ring-2 focus:!ring-[#e11d48]/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <textarea
              name="message"
              rows="4"
              placeholder="Tell us about your cake order... (minimum 10 characters)"
              value={form.message}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 rounded-xl !border-2 !border-gray-600 !bg-white !text-black placeholder-gray-400 focus:!border-[#e11d48] focus:!ring-2 focus:!ring-[#e11d48]/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white py-3 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Sending...
                </>
              ) : (
                <>📨 Send Message</>
              )}
            </button>

          </form>

          {/* SOCIAL BUTTONS */}
          <div className="mt-8 text-center">

            <p className="font-semibold text-gray-700 mb-4">
              Or Contact Us Instantly
            </p>

            <div className="flex flex-wrap justify-center gap-4">

              {/* WhatsApp */}
              <a
                href="https://api.whatsapp.com/send/?phone=9111525695"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow border border-green-200 hover:scale-105 transition"
              >
                <FaWhatsapp /> WhatsApp
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow border border-pink-200 hover:scale-105 transition"
              >
                <FaInstagram /> Instagram
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow border border-blue-200 hover:scale-105 transition"
              >
                <FaFacebook /> Facebook
              </a>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-[#ffe4ea]">
            <h3 className="text-xl font-semibold text-[#e11d48] mb-2">
              Visit Our Bakery
            </h3>

            <p className="text-gray-600 mb-3">
              Come visit us and experience freshly baked cakes.
            </p>

            <p className="text-gray-700 flex items-center gap-2">
  <FaMapMarkerAlt className="text-[#e11d48]" />
  Bhilai, Chhattisgarh, India
</p>

            <p className="text-gray-700">⏰ Open: 9 AM – 10 PM</p>

            <a
  href="https://www.google.com/maps?q=21.2309197,81.3454753&z=18"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block mt-4 bg-[#e11d48] hover:bg-[#be123c] text-white px-6 py-2.5 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105"
>
  Visit Store
</a>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-[#ffe4ea] bg-white">
           <iframe
  title="map"
  src="https://www.google.com/maps?q=21.2309197,81.3454753&z=18&output=embed"
  loading="lazy"
  className="w-full h-[350px]"
></iframe>
          </div>

        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

        <div className="bg-white p-6 rounded-2xl shadow border border-[#ffe4ea]">
          <h4 className="font-semibold text-[#e11d48] mb-2">Custom Cakes</h4>
          <p className="text-gray-600 text-sm">
            Personalized cakes for every celebration.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-[#ffe4ea]">
          <h4 className="font-semibold text-[#e11d48] mb-2">Fast Delivery</h4>
          <p className="text-gray-600 text-sm">
            Same-day delivery available.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-[#ffe4ea]">
          <h4 className="font-semibold text-[#e11d48] mb-2">Fresh Ingredients</h4>
          <p className="text-gray-600 text-sm">
            Premium ingredients baked daily.
          </p>
        </div>

      </div>
    </div>
  );
}

export default ContactUs;