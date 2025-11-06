"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie"; // make sure to install: npm install js-cookie
import ProtectedRoute from "@/components/ProtectedRoute";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          method: "GET",
          credentials: "include", // This sends the httpOnly cookie
        });

        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn("Unexpected response:", data);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

  if (loading)
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-gray-600 text-sm font-medium">Total Orders</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-gray-600 text-sm font-medium">Total Spent (₦)</h2>
          <p className="text-2xl font-bold text-green-700 mt-2">
            {totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order History</h3>
        {orders.length === 0 ? (
          <p className="text-gray-600">You haven’t made any orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm">
                  <th className="p-3 font-semibold">Product</th>
                  <th className="p-3 font-semibold">Qty</th>
                  <th className="p-3 font-semibold">Amount (₦)</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-800">{order.product}</td>
                    <td className="p-3 text-gray-800">{order.qty}</td>
                    <td className="p-3 text-gray-800">
                      {order.amount?.toLocaleString() || "0"}
                    </td>
                    <td
                      className={`p-3 font-medium ${
                        order.status === "Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.status}
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Wrap Orders inside ProtectedRoute
export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  );
}
