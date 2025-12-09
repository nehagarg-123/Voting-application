import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// 👇 IMPORT THE IMAGE HERE (Make sure the path and filename are exactly right)
import signupImage from "../assets/signupimage.png"; 

export default function Signup() {
  const [step, setStep] = useState(1); // 1 = Send OTP, 2 = Fill Details
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    otp: "", // Holds the entered OTP
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 👇 Access Environment Variable
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STAGE 1: SEND OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 👇 Updated URL
      const response = await fetch(`${API_BASE_URL}/user/signup/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP sent to your email!");
        setStep(2); // Move to next step
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  // --- STAGE 2: VERIFY & REGISTER ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 👇 Updated URL
      const response = await fetch(`${API_BASE_URL}/user/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Sends OTP + Name + Pass + ID
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup Successful! Please Login.");
        navigate("/login");
      } else {
        setError(data.error || "Signup Failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error.");
    }
  };

  return (
    // 1️⃣ Outer Container changed to relative to hold background layers
    <div className="relative w-screen h-screen overflow-hidden">
      
      {/* 2️⃣ Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${signupImage})` }}
      ></div>

      {/* 3️⃣ Overlay Layer (Makes text easier to read) */}
      <div className="absolute inset-0 bg-purple-900/40 z-0"></div>

      {/* 4️⃣ Content Container (Centers the form and puts it on top) */}
      <div className="relative min-h-screen flex items-center justify-center z-10 p-4">
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 border border-white/30">
          <h2 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
            {step === 1 ? "Verify Email" : "Finish Signup"}
          </h2>

          {error && <div className="bg-red-500/80 text-white text-sm p-2 rounded mb-4 text-center backdrop-blur-sm">{error}</div>}

          {step === 1 ? (
            // --- FORM STEP 1 ---
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <input
                type="email"
                name="email"
                placeholder="College Email"
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner text-gray-800 placeholder-gray-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition duration-300 shadow-lg"
              >
                Send OTP
              </button>
            </form>
          ) : (
            // --- FORM STEP 2 ---
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div className="bg-white/50 p-2 rounded text-center text-sm font-semibold text-gray-900">
                OTP sent to: {formData.email}
              </div>
              
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner text-gray-800 placeholder-gray-500"
                required
              />

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner text-gray-800 placeholder-gray-500"
                required
              />

              <input
                type="text"
                name="studentId"
                placeholder="Student ID / Roll No"
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner text-gray-800 placeholder-gray-500"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="p-3 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner text-gray-800 placeholder-gray-500"
                required
              />

              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-lg font-bold transition duration-300 shadow-lg"
              >
                Register
              </button>
            </form>
          )}

          <p className="text-white text-center mt-4 drop-shadow">
            Already have an account? <a href="/login" className="underline font-bold hover:text-purple-200 transition">Log In</a>
          </p>
        </div>
      </div>
    </div>
  );
}
