import React from "react";
import LoginForm from "./components/LoginForm";
import useAuth from "./hooks/useAuth";
import App from "./App";

function AppAuth() {
  const { user, loading, refreshAuth, logout } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ 
            fontSize: '2rem',
            animation: 'spin 1s linear infinite' 
          }}>🎯</div>
          <div style={{ color: 'var(--text-secondary)' }}>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <LoginForm onLogin={refreshAuth} />
      </div>
    );
  }

  return <App user={user} logout={logout} />;
}

export default AppAuth;
