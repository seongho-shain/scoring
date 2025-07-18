
import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

import Scoreboard from "./components/Scoreboard";
import AppWithForm from "./AppWithForm";
import AdminPage from "./pages/AdminPage";
import "./App.css";

function Navigation({ user, logout }) {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "점수판", icon: "🏆" },
    { path: "/input", label: "점수 입력", icon: "📝" },
    { path: "/admin", label: "관리자", icon: "⚙️", roles: ['admin'] }
  ].filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <div className="nav-container">
      <div className="nav-content">
        <div className="nav-brand">
          🎯 해커톤 점수판
        </div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div style={{ 
            marginLeft: '1rem', 
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--background)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>👤 {user?.username}</span>
            <span style={{ 
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: user?.role === 'admin' ? 'var(--warning-color)' : 'var(--primary-color)',
              color: 'white',
              borderRadius: '0.25rem'
            }}>
              {user?.role === 'admin' ? '관리자' : user?.role === 'judge' ? '심사위원' : '참가자'}
            </span>
            <button
              onClick={logout}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App({ user, logout }) {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navigation user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<AppMain><Scoreboard /></AppMain>} />
          <Route path="/input" element={<AppMain><AppWithForm user={user} /></AppMain>} />
          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminPage />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function AppMain({ children }) {
  return (
    <div className="main-content">
      {children}
    </div>
  );
}

export default App;
