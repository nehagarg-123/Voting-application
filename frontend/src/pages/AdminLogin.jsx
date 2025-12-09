import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 👇 Access Environment Variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // ✅ handleLogin inside the component
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 👇 Updated to use the variable
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin-dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="relative w-screen min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-800 to-blue-700 p-4">
      <form onSubmit={handleLogin} className="bg-violet-300 rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <input
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 mb-6 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors duration-300">
          Login
        </button>
      </form>
    </div>
  );
}
