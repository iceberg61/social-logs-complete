"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    }
  }, [user, loading, router]);

  if (loading || checking)
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Blue ring loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 animate-spin border-t-transparent"></div>
        </div>


        <p className="text-base font-medium text-blue-600 animate-pulse">
          Checking authentication...
        </p>
      </div>
    </div>
  );


  return children;
}
