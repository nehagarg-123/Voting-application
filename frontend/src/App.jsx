import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Voting from './pages/Voting'
import Results from './pages/Results'
import Leaderboard from './pages/Leaderboard'
import Navbar from './components/Navbar'

import AdminLogin from "./pages/AdminLogin"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import AddCandidate from "./pages/AddCandidate";
import EditCandidate from "./pages/EditCandidate";


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  return (
    
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vote" element={<ProtectedRoute><Voting /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

          <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
         <Route path="/admin/add" element={<AddCandidate />} />
        <Route path="/admin/edit/:id" element={<EditCandidate />} />
        </Routes>
      </main>
    </div>
  )
  
}
