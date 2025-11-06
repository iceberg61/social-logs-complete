"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext'; // ✅ New import
import Sidebar from "./components/Sidebar";
import {
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  Music,
} from "lucide-react";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth(); // ✅ Get user from context
  const [username, setUsername] = useState("User");

  // ✅ Get username from Auth Context (cookies)
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const categories = [
    { id: "instagram", name: "Instagram", icon: <Instagram className="text-pink-500" /> },
    { id: "twitter", name: "Twitter / X", icon: <Twitter className="text-sky-500" /> },
    { id: "facebook", name: "Facebook", icon: <Facebook className="text-blue-600" /> },
    { id: "tiktok", name: "TikTok", icon: <Music className="text-gray-900" /> },
    { id: "youtube", name: "YouTube", icon: <Youtube className="text-red-600" /> },
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="text-blue-700" /> },
  ];

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Add logout to your sidebar/header if needed
  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar - pass logout if your Sidebar has logout button */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout} // ✅ Optional: if your sidebar has logout
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="p-6 space-y-10">
            {/* Header - Now shows real username! */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Welcome, {username}! 👋
                </h2>
                <p className="text-gray-600 mt-1">
                  Available Social Media Accounts
                </p>
                {/* ✅ Real balance from backend */}
                <p className="text-sm text-green-600 font-medium mt-1">
                  Balance: ${user?.balance || 0}
                </p>
              </div>

              {/* Categories dropdown */}
              <div className="relative">
                <select
                  onChange={(e) => handleScroll(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-700 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Sections - SAME */}
            {categories.map((cat) => (
              <section key={cat.id} id={cat.id} className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  {cat.icon}
                  <h3 className="text-xl font-semibold text-gray-800">{cat.name}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* // In the grid loop of categories */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl p-5 shadow hover:shadow-lg border border-gray-100 transition-transform transform hover:-translate-y-1"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {cat.name} Account #{i + 1}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Followers: {Math.floor(Math.random() * 50)}k | Niche: Fashion
                      </p>
                      <button
                        onClick={async () => {
                          const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                          const res = await fetch('/api/balance/update', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ amount: 10, operation: 'subtract' }) // Example: deduct $10
                          });
                          const data = await res.json();
                          if (res.ok) {
                            alert(`Purchase successful! New balance: $${data.balance}`);
                            // Optionally refresh user data
                          } else {
                            alert(data.error);
                          }
                        }}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-full py-2 rounded-lg hover:opacity-90 transition"
                      >
                        Buy Now
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}