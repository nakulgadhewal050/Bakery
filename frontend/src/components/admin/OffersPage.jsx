import React, { useState } from "react";
import CreateCoupon from "./CreateCoupon";

const OffersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: "BAKE20",
      discount: "20% Off",
      expiry: "2025-12-31",
      active: true,
    },
    {
      id: 2,
      code: "FESTIVE10",
      discount: "10% Off",
      expiry: "2025-10-15",
      active: false,
    },
  ]);

  // ➕ Add new coupon
  const handleAddCoupon = (newCoupon) => {
    setCoupons([...coupons, { ...newCoupon, id: Date.now() }]);
    setShowModal(false);
  };

  // ❌ Delete coupon
  const handleDeleteCoupon = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this coupon?"
    );
    if (!confirmDelete) return;

    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-2xl font-bold mb-6">Offers & Coupons</h2>

      <button
        onClick={() => setShowModal(true)}
        className="mb-4 px-5 py-2 bg-[#d69e64] text-white rounded-2xl shadow hover:bg-[#c17f40]"
      >
        Create New Coupon
      </button>

      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#f7e8dc] text-[#3f2e20]">
              <th className="py-3 px-4 text-left font-semibold">Code</th>
              <th className="py-3 px-4 text-left font-semibold">Discount</th>
              <th className="py-3 px-4 text-left font-semibold">Expiry</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-left font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-50 text-[#3f2e20]"
              >
                <td className="py-4 px-5 font-semibold">{c.code}</td>
                <td className="py-4 px-5 font-semibold">{c.discount}</td>
                <td className="py-4 px-5 font-semibold">{c.expiry}</td>
                <td className="py-4 px-5 font-semibold">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      c.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* ✅ ONLY DELETE BUTTON */}
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="px-3 py-1 bg-red-400 hover:bg-red-600 text-white rounded-md text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateCoupon
          onClose={() => setShowModal(false)}
          onSave={handleAddCoupon}
        />
      )}
    </div>
  );
};

export default OffersPage;
