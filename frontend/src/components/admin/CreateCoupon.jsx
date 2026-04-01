import React, { useState } from 'react';

const CreateCoupon = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        code: "",
        discount: "",
        expiry: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newCoupon = {
            id: Date.now(),
            code: form.code,
            discount: form.discount,
            expiry: form.expiry,
            active: true,
        };

        onSave(newCoupon);   // Add new coupon to list
        onClose();           // Close modal
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-lg">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Coupon</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 text-xl hover:bg-gray-200 p-2 rounded-full"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Coupon Code</label>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-[#dda56a]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Discount (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={form.discount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-[#dda56a]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Expiry Date</label>
                        <input
                            type="date"
                            name="expiry"
                            value={form.expiry}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-[#dda56a]"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#dda56a] text-white rounded-lg hover:bg-[#c98f5a]"
                        >
                            Save Coupon
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateCoupon;
