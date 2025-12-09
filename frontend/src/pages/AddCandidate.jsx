import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddCandidate() {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [image, setImage] = useState(""); // URL field
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
   
      const response = await fetch(`${API_BASE_URL}/candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, party, image }),
      });

      if (response.ok) {
        navigate("/admin-dashboard");
      } else {
        console.error("Failed to add candidate");
        alert("Failed to add candidate. Please check your token or connection.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen relative w-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-blue-400 to-yellow-800 p-4">
      <form className="bg-pink-100 rounded-xl shadow-lg p-10 w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Add Candidate</h2>

        <input
          type="text"
          placeholder="Candidate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          placeholder="Party"
          value={party}
          onChange={(e) => setParty(e.target.value)}
          required
          className="w-full p-3 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full p-3 mb-6 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors duration-300"
        >
          Add Candidate
        </button>
      </form>
    </div>
  );
}
