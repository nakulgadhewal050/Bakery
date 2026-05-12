import React from 'react';

const CustomerDetail = () => {
    const customers = [
        { id: 1, name: "Amit Sharma", orders: 12, spent: 8500, rating: 4.5 },
        { id: 2, name: "Priya Verma", orders: 8, spent: 6000, rating: 4.8 },
        { id: 3, name: "Rahul Singh", orders: 5, spent: 3200, rating: 4.2 }
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Customers</h2>

            <div className="bg-white p-4 rounded-xl shadow overflow-auto text-[#3f2e20]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#f7e8dc] text-[#3f2e20]">
                            <th className="py-4 px-5 text-left font-semibold">Customer</th>
                            <th className="py-4 px-5 text-left font-semibold">Orders</th>
                            <th className="py-4 px-5 text-left font-semibold">Total Spent</th>
                            <th className="py-4 px-5 text-left font-semibold">Rating</th>
                        </tr>
                    </thead>

                    <tbody>
                        {customers.map((c) => (
                            <tr
                                key={c.id}
                                className=" last:border-none hover:bg-gray-50 transition text-[#3f2e20]"
                            >
                                <td className="py-3 px-5">{c.name}</td>
                                <td className="py-3 px-5">{c.orders}</td>
                                <td className="py-3 px-5">₹{c.spent}</td>
                                <td className="py-3 px-5">{c.rating} ⭐</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerDetail;
