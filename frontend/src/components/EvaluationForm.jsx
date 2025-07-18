import React, { useState } from "react";

const initialState = {
  team_id: "",
  user_id: "",
  evaluator_type: "judge",
  creativity: 0,
  impact: 0,
  completeness: 0,
  presentation: 0,
  bonus: 0,
};

function EvaluationForm({ teams, user, onSubmit }) {
  const [form, setForm] = useState({ 
    ...initialState, 
    user_id: user?.username || user?.id || 1,
    evaluator_type: user?.role === 'judge' ? 'judge' : 'peer'
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumber = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/evaluations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      setMessage("제출 완료!");
      setForm({ 
        ...initialState, 
        user_id: user?.username || user?.id || 1,
        evaluator_type: user?.role === 'judge' ? 'judge' : 'peer'
      });
      if (onSubmit) onSubmit();
    } catch (err) {
      setMessage("에러: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalScore = form.creativity + form.impact + form.completeness + form.presentation + form.bonus;
  const selectedTeam = teams.find(team => team.id === Number(form.team_id));

  return (
    <div className="section">
      <div className="card">
        <div className="page-header">
          <h2 className="section-title">📝 점수 입력</h2>
          <p className="page-subtitle">
            평가할 팀과 점수를 입력해주세요. 각 항목은 0-25점으로 평가됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-with-label">
              <label>📋 팀 선택</label>
              <select 
                name="team_id" 
                value={form.team_id} 
                onChange={handleChange} 
                required
              >
                <option value="">-- 평가할 팀을 선택하세요 --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} {team.presentation_order && `(발표순서: ${team.presentation_order}번)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-with-label">
              <label>👤 평가자 유형</label>
              <select 
                name="evaluator_type" 
                value={form.evaluator_type} 
                onChange={handleChange}
              >
                <option value="judge">🧑‍⚖️ 심사위원</option>
                <option value="peer">👥 동료 평가</option>
              </select>
            </div>
          </div>

          {selectedTeam && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'var(--background)', 
              borderRadius: '0.5rem', 
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                선택된 팀: {selectedTeam.name}
              </h4>
              {selectedTeam.presentation_order && (
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  발표순서: {selectedTeam.presentation_order}번
                </p>
              )}
            </div>
          )}

          <div className="section">
            <h3 className="section-title">📊 평가 점수 (각 항목 0-25점)</h3>
            <div className="form-grid">
              <div className="input-with-label">
                <label>💡 창의력</label>
                <input 
                  type="number" 
                  name="creativity" 
                  min="0" 
                  max="25" 
                  step="0.1"
                  value={form.creativity} 
                  onChange={handleNumber} 
                  required 
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  아이디어의 참신성과 독창성
                </small>
              </div>

              <div className="input-with-label">
                <label>🚀 파급력</label>
                <input 
                  type="number" 
                  name="impact" 
                  min="0" 
                  max="25" 
                  step="0.1"
                  value={form.impact} 
                  onChange={handleNumber} 
                  required 
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  사회적 영향력과 실용성
                </small>
              </div>

              <div className="input-with-label">
                <label>✅ 완성도</label>
                <input 
                  type="number" 
                  name="completeness" 
                  min="0" 
                  max="25" 
                  step="0.1"
                  value={form.completeness} 
                  onChange={handleNumber} 
                  required 
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  구현의 완성도와 품질
                </small>
              </div>

              <div className="input-with-label">
                <label>🎤 발표점수</label>
                <input 
                  type="number" 
                  name="presentation" 
                  min="0" 
                  max="25" 
                  step="0.1"
                  value={form.presentation} 
                  onChange={handleNumber} 
                  required 
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  발표 내용과 전달력
                </small>
              </div>

              <div className="input-with-label">
                <label>⭐ 가산점 (선택)</label>
                <input 
                  type="number" 
                  name="bonus" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  value={form.bonus} 
                  onChange={handleNumber} 
                />
                <small style={{ color: 'var(--text-secondary)' }}>
                  특별한 노력이나 성과에 대한 추가 점수
                </small>
              </div>

              <div className="input-with-label">
                <label>🏆 총점</label>
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: 'var(--background)', 
                  border: '2px solid var(--primary-color)', 
                  borderRadius: '0.5rem',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--primary-color)',
                  textAlign: 'center'
                }}>
                  {totalScore.toFixed(1)}점
                </div>
                <small style={{ color: 'var(--text-secondary)' }}>
                  기본 100점 + 가산점
                </small>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="secondary"
              onClick={() => setForm({ 
                ...initialState, 
                user_id: user?.username || user?.id || 1,
                evaluator_type: user?.role === 'judge' ? 'judge' : 'peer'
              })}
              disabled={isSubmitting}
            >
              초기화
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !form.team_id}
            >
              {isSubmitting ? '제출 중...' : '점수 제출'}
            </button>
          </div>

          {message && (
            <div className={`status-message ${message.startsWith("에러") ? "status-error" : "status-success"}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default EvaluationForm;
