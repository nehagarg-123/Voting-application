import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import Leaderboard from "./Leaderboard"; 

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");


  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch candidates (for the Manage view)
  useEffect(() => {

    fetch(`${API_BASE_URL}/candidate`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCandidates(data))
      .catch((err) => console.error(err));
  }, [token, API_BASE_URL]);

  // Delete candidate
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this candidate?");
    if (!confirmDelete) return;

    // 👇 Updated URL
    await fetch(`${API_BASE_URL}/candidate/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCandidates(candidates.filter((c) => c._id !== id));
  };

  return (
    <div className="min-h-screen relative w-screen p-10 bg-gradient-to-r from-purple-400 via-pink-300 to-yellow-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Admin Dashboard
      </h2>

      {/* --- CONTROL BUTTONS --- */}
      <div className="flex justify-center gap-4 mb-8">
        {/* Toggle: Manage Candidates */}
        <button
          onClick={() => setShowLeaderboard(false)}
          className={`px-6 py-3 rounded-lg font-semibold shadow-lg transition duration-300 ${
            !showLeaderboard 
            ? "bg-purple-600 text-white" 
            : "bg-white text-purple-600 hover:bg-gray-100"
          }`}
        >
          ✏️ Manage Candidates
        </button>

        {/* Toggle: View Leaderboard */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className={`px-6 py-3 rounded-lg font-semibold shadow-lg transition duration-300 ${
            showLeaderboard 
            ? "bg-purple-600 text-white" 
            : "bg-white text-purple-600 hover:bg-gray-100"
          }`}
        >
           Live Results
        </button>

        {/* Action: Add Candidate (Only visible when managing) */}
        {!showLeaderboard && (
          <button
            onClick={() => navigate("/admin/add")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 font-semibold"
          >
            ➕ Add Candidate
          </button>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      {showLeaderboard ? (
        // VIEW 1: LEADERBOARD
        <div className="bg-white/80 rounded-xl p-6 shadow-xl backdrop-blur-sm">
           <Leaderboard /> 
        </div>
      ) : (
      
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {candidates.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl shadow-lg p-5 flex flex-col items-center hover:scale-105 transform transition duration-300"
            >
              {c.image && (
                <img
