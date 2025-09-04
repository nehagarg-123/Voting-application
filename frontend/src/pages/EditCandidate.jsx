import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditCandidate() {
  const { id } = useParams(); // get candidate ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  // State for candidate fields
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [image, setImage] = useState("");

  // Fetch candidate data when component mounts
  useEffect(() => {
    fetch(`http://localhost:5000/candidate/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setParty(data.party || "");
        setImage(data.image || "");
      })
      .catch((err) => console.error(err));
  }, [id, token]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send updated data to backend
    await fetch(`http://localhost:5000/candidate/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, party, image }),
    });

    navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen relative w-screen  flex items-center justify-center bg-gradient-to-r from-red-400 via-pink-400 to-green-300 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-violet-200 rounded-xl shadow-lg p-10 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Edit Candidate
        </h2>

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
          className="w-full bg-blue-800 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-300"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
