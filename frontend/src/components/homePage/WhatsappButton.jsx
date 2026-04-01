import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";

const WhatsappButton = () => {
    const phoneNumber = "7378021327";
    const message = "Hi! I want to place an order. Can you help me with the details?";

    return (
        <Link
            to={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 z-50 bg-green-500 p-4 rounded-full shadow-xl animate-bounce hover:animate-none hover:scale-110 transition"
        >
            <FaWhatsapp className="text-white" size={28} />
        </Link>
    );
};

export default WhatsappButton;
