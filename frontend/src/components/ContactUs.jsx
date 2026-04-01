import { useState } from "react";
import { FaWhatsapp, FaFacebook, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";

function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await fetch("/api/contact/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setSuccess("Message sent successfully!");
      setError("");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Failed to send message. Try again later.");
      setSuccess("");
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

          {error && <p className="text-[#e11d48] mb-3">{error}</p>}
          {success && <p className="text-green-600 mb-3">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl !border-2 !border-gray-600 !bg-white !text-black placeholder-gray-400 focus:!border-[#e11d48] focus:!ring-2 focus:!ring-[#e11d48]/30 focus:outline-none"
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
             className="w-full p-3 rounded-xl !border-2 !border-gray-600 !bg-white !text-black placeholder-gray-400 focus:!border-[#e11d48] focus:!ring-2 focus:!ring-[#e11d48]/30 focus:outline-none"
            />

            <textarea
              name="message"
              rows="4"
              placeholder="Tell us about your cake order..."
              value={form.message}
              onChange={handleChange}
              className="w-full p-3 rounded-xl !border-2 !border-gray-600 !bg-white !text-black placeholder-gray-400 focus:!border-[#e11d48] focus:!ring-2 focus:!ring-[#e11d48]/30 focus:outline-none"
            />

            <button
              type="submit"
              className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white py-3 rounded-full font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              Send Message
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
                href="https://api.whatsapp.com/send/?phone=7378021327"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow border border-green-200 hover:scale-105 transition"
              >
                <FaWhatsapp /> WhatsApp
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/graphura.in"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow border border-pink-200 hover:scale-105 transition"
              >
                <FaInstagram /> Instagram
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/Graphura.in"
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
  Gurgaon, Haryana
</p>

            <p className="text-gray-700">⏰ Open: 9 AM – 10 PM</p>

           <a
  href="https://www.google.com/maps/dir//Graphura+India+Private+Limited,+near+Renu+Sharma+Foundation,+Pataudi,+Gurgaon,+Haryana+122503/"
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
  src="https://www.google.com/maps?q=Graphura+India+Private+Limited,+Pataudi,+Gurgaon,+Haryana+122503&output=embed"
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