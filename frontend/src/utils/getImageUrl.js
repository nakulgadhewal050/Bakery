// src/utils/getImageUrl.js

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getImageUrl = (img) => {
  if (!img) return "";

  if (img.startsWith("http")) return img;
  if (img.startsWith("/uploads")) return `${BASE_URL}${img}`;

  return img;
};
