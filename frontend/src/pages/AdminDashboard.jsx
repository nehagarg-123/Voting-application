import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // fetch all candidates
  useEffect(() => {
    fetch("http://localhost:5000/candidate", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCandidates(data))
      .catch((err) => console.error(err));
  }, [token]);

  // delete candidate
  const handleDelete = async (id) => {
    await fetch(`https://voting-application-5wm0.onrender.com/candidate/${id}`, {
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
      <div className="flex justify-center mb-8">
        <button
          onClick={() => navigate("/admin/add")}
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 font-semibold"
        >
          ➕ Add Candidate
        </button>
      </div>

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
    </div>
  );
}
