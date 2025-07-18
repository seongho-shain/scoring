import React, { useState } from "react";

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      
      if (!res.ok) {
        throw new Error("로그인 실패");
      }
      
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      
      // 로그인 성공 후 인증 상태 새로고침
      if (onLogin) {
        onLogin();
      }
    } catch (err) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="page-header">
          <h2 className="section-title">🔐 로그인</h2>
          <p className="page-subtitle">
            해커톤 점수판에 접속하려면 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-with-label">
              <label>사용자 아이디</label>
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="input-with-label">
              <label>비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !username || !password}
            style={{ width: '100%' }}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>

          {error && (
            <div className="status-message status-error">
              {error}
            </div>
          )}
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: 'var(--background)', 
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
            💡 테스트 계정
          </div>
          <div>관리자: admin / admin123</div>
          <div>심사위원: judge / judge123</div>
          <div>참가자: user / user123</div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
