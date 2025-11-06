"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import FundAccount from "../components/FundAccount";
import { useAuth } from "../contexts/AuthContext"; // Verify this path

export default function FundPage() {
  // ✅ Optional: const { user } = useAuth(); if you need user data here (e.g., for conditional rendering)

  // ✅ Fix: No useEffect needed; auth is handled by ProtectedRoute and context

  return (
    <ProtectedRoute>
      <FundAccount />
    </ProtectedRoute>
  );
}