import React, { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [candidates, setCandidates] = useState([]);
  const API_BASE = 'http://localhost:5000'; 

  // Sort candidates by vote count (Highest to Lowest)
  const sortCandidates = (list) => {
    return [...(list || [])].sort((a, b) => (b.count || 0) - (a.count || 0));
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/candidate/vote/count`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const data = await res.json();
      setCandidates(sortCandidates(data));
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // Live update
    return () => clearInterval(interval);
  }, []);

  return (
    // Red Gradient Background
    <div className="w-full max-w-4xl mx-auto p-8 mt-24 bg-gradient-to-br from-red-600 via-red-500 to-orange-400 rounded-3xl shadow-2xl border-4 border-red-700">
      
      <h2 className="text-3xl font-extrabold text-center mb-8 text-white drop-shadow-md">
          Live Leaderboard
      </h2>

      {/* List Container */}
      <ul className="space-y-4">
        {candidates.map((c, i) => (
          <li
            key={i}
            className="bg-white rounded-2xl shadow-lg p-5 flex justify-between items-center hover:scale-105 transition duration-300 border-2 border-red-100"
          >
            <div className="flex items-center gap-6">
              
              {/* 👇 Rank Number: UNIFORM COLOR (All Red now) */}
              <div className="text-2xl font-black w-12 text-center text-red-700">
                #{i + 1}
              </div>

              {/* Candidate Image */}
              <img
                src={c.photo || c.image || '/default.png'}
                alt={c.name}
                className="w-16 h-16 rounded-full object-cover bg-gray-200 border-2 border-red-200 shadow-sm"
              />

              {/* Name & Party */}
              <div>
                <div className="text-xl font-bold text-gray-800">{c.name}</div>
                <div className="text-sm text-red-500 font-bold uppercase tracking-wide">{c.party}</div>
              </div>
            </div>

            {/* Vote Count */}
            <div className="text-right bg-red-50 px-5 py-2 rounded-xl border border-red-100">
              <div className="text-3xl font-black text-red-600">
                {c.count || 0}
              </div>
              <div className="text-xs text-red-400 uppercase font-bold tracking-wider">
                Votes
              </div>
            </div>
          </li>
        ))}
      </ul>
      
      {candidates.length === 0 && (
        <div className="text-center text-white mt-10 bg-white/20 p-6 rounded-xl font-semibold backdrop-blur-md">
          Waiting for the first votes...
        </div>
      )}
    </div>
  );
}
