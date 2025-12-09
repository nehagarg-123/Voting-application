import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Leaderboard from "./Leaderboard"; 

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch candidates
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
                  src={c.image}
                  alt={c.name}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-purple-500"
                />
              )}
              <h3 className="text-xl font-bold mb-1 text-gray-700">{c.name}</h3>
              <p className="text-gray-500 mb-4">{c.party}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/admin/edit/${c._id}`)}
                  className="bg-blue-800 text-white px-4 py-1 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
