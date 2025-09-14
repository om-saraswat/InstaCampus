"use client";
import { useState } from "react";
import api from "../../lib/axios";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    enrollmentNo: "",
    password: "",
    role: "student",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/signup", form);
      setMessage(res.data.message);
      setForm({ name: "", email: "", enrollmentNo: "", password: "", role: "student" });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="space-y-3">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 w-full" />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 w-full" />
        <input name="enrollmentNo" placeholder="Enrollment Number" value={form.enrollmentNo} onChange={handleChange} className="border p-2 w-full" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 w-full" />
        <select name="role" value={form.role} onChange={handleChange} className="border p-2 w-full">
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      {message && <p className="mt-3 text-green-600">{message}</p>}
    </div>
  );
}
