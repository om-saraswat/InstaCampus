"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";

export default function LogoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch (err) {
      alert("Logout failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Logout</h1>
      <button onClick={handleLogout} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded">
        {loading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
