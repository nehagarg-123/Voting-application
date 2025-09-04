import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const userToken = localStorage.getItem("token");      // ✅ user login
  const adminToken = localStorage.getItem("adminToken"); // ✅ admin login
  const isLoggedIn = userToken || adminToken;           // ✅ check both

  const handleLogout = () => {
    localStorage.removeItem("token");      // remove user token
    localStorage.removeItem("adminToken"); // remove admin token
    navigate("/"); // go to landing page
  };

  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex justify-end gap-4 items-center shadow-md fixed top-0 left-0 z-50">
      {isLoggedIn ? (
        <>
          {/* Show different links depending on login type */}
          {userToken && (
            <>
              <Link
                to="/results"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
              >
                Result
              </Link>
              <Link
                to="/leaderboard"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
              >
                Leaderboard
              </Link>
            </>
          )}

          {adminToken && (
            <Link
              to="/admin-dashboard"
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <div className="flex gap-6">
          <Link
            to="/login"
            className="px-2 text-xl hover:underline hover:decoration-red-800 transition"
          >
            User
          </Link>
          <Link
            to="/admin-login"
            className="px-2 text-xl hover:underline hover:decoration-red-800 transition"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
