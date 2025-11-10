import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Board from './components/Board/Board';
import './App.css';

function AppContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const { currentUser } = useAuth();

  if (!currentUser) {
    return isLogin ? (
      <Login onToggleMode={() => setIsLogin(false)} />
    ) : (
      <Signup onToggleMode={() => setIsLogin(true)} />
    );
  }

  if (selectedTeam) {
    return <Board team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  }

  return <Dashboard onSelectTeam={setSelectedTeam} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
