import React, { useEffect, useState } from "react";

function TeamRegistration({ onTeamsUpdated }) {
  const [teamInput, setTeamInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleBulkCreate = async () => {
    if (!teamInput.trim()) {
      setMessage("팀명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const teamNames = teamInput.split('\n').map(name => name.trim()).filter(name => name);
      
      const res = await fetch("/teams/bulk/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_names: teamNames }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const result = await res.json();
      setMessage(result.message);
      setTeamInput("");
      
      if (onTeamsUpdated) {
        onTeamsUpdated();
      }
    } catch (err) {
      setMessage("에러: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("모든 팀과 관련 평가 데이터가 삭제됩니다. 정말 진행하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/teams/", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const result = await res.json();
      setMessage(result.message);
      
      if (onTeamsUpdated) {
        onTeamsUpdated();
      }
    } catch (err) {
      setMessage("에러: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSampleTeams = () => {
    const sampleTeams = Array.from({ length: 8 }, (_, i) => `팀명${i + 1}`).join('\n');
    setTeamInput(sampleTeams);
  };

  return (
    <div className="card">
      <h3 className="section-title">👥 팀 등록 관리</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        발표순서대로 팀명을 입력하면 자동으로 팀이 등록됩니다. 한 줄에 하나씩 입력하세요.
      </p>

      <div className="form-group">
        <div className="input-with-label">
          <label>팀명 입력 (한 줄에 하나씩)</label>
          <textarea
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
            placeholder={`팀명1\n팀명2\n팀명3\n...\n\n각 줄에 하나씩 팀명을 입력하세요`}
            rows={8}
            style={{
              width: '100%',
              resize: 'vertical',
              fontFamily: 'monospace'
            }}
            disabled={isSubmitting}
          />
          <small style={{ color: 'var(--text-secondary)' }}>
            입력된 순서대로 발표순서가 자동 배정됩니다.
          </small>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={generateSampleTeams}
          className="secondary"
          disabled={isSubmitting}
        >
          📝 샘플 팀명 생성
        </button>
        <button 
          onClick={handleBulkCreate}
          disabled={isSubmitting || !teamInput.trim()}
        >
          {isSubmitting ? '등록 중...' : '팀 일괄 등록'}
        </button>
        <button 
          onClick={handleDeleteAll}
          className="secondary"
          disabled={isSubmitting}
          style={{ 
            backgroundColor: 'var(--error-color)',
            color: 'white',
            borderColor: 'var(--error-color)'
          }}
        >
          🗑️ 모든 팀 삭제
        </button>
      </div>

      {teamInput && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'var(--background)', 
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            미리보기: {teamInput.split('\n').filter(name => name.trim()).length}개 팀
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {teamInput.split('\n').map((name, idx) => name.trim()).filter(name => name).map((name, idx) => (
              <div key={idx}>
                {idx + 1}. {name}
              </div>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div className={`status-message ${message.startsWith("에러") ? "status-error" : "status-success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

function AdminPage() {
  const [weights, setWeights] = useState({ judge: 0.6, peer: 0.3, bonus: 0.1 });
  const [order, setOrder] = useState([]);
  const [teams, setTeams] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/teams/")
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("팀 목록 조회 실패:", err);
        setLoading(false);
      });
  }, []);

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setWeights((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleOrderChange = (idx, value) => {
    setOrder((prev) => {
      const next = [...prev];
      next[idx] = Number(value);
      return next;
    });
  };

  const saveWeights = async () => {
    setMsg("");
    setIsSubmitting(true);
    try {
      const totalWeight = weights.judge + weights.peer + weights.bonus;
      if (Math.abs(totalWeight - 1.0) > 0.01) {
        throw new Error("가중치의 합은 1.0이어야 합니다. 현재 합: " + totalWeight.toFixed(2));
      }

      const res = await fetch("/admin/weights/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("가중치가 저장되었습니다.");
    } catch (err) {
      setMsg("에러: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveOrder = async () => {
    setMsg("");
    setIsSubmitting(true);
    try {
      const orderArr = teams.map((team, idx) => ({ 
        team_id: team.id, 
        presentation_order: order[idx] || 0 
      }));
      
      const res = await fetch("/admin/presentation_order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderArr),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("발표순서가 저장되었습니다.");
    } catch (err) {
      setMsg("에러: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWeights = () => {
    setWeights({ judge: 0.6, peer: 0.3, bonus: 0.1 });
  };

  const autoAssignOrder = () => {
    const shuffled = [...Array(teams.length)].map((_, i) => i + 1).sort(() => Math.random() - 0.5);
    setOrder(shuffled);
  };

  useEffect(() => {
    if (teams.length) {
      setOrder(teams.map((t) => t.presentation_order || 0));
    }
  }, [teams]);

  const totalWeight = weights.judge + weights.peer + weights.bonus;
  const isWeightValid = Math.abs(totalWeight - 1.0) <= 0.01;

  if (loading) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">관리자 페이지</h1>
          <p className="page-subtitle">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">⚙️ 관리자 페이지</h1>
        <p className="page-subtitle">점수 가중치와 발표 순서를 관리할 수 있습니다</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* 팀 등록 섹션 */}
        <TeamRegistration onTeamsUpdated={() => {
          fetch("/teams/")
            .then((res) => res.json())
            .then((data) => {
              setTeams(data);
            })
            .catch((err) => {
              console.error("팀 목록 조회 실패:", err);
            });
        }} />

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* 가중치 설정 */}
          <div className="card">
            <h3 className="section-title">📊 점수 가중치 설정</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              각 평가 유형별 가중치를 설정합니다. 모든 가중치의 합은 1.0이어야 합니다.
            </p>

          <div className="form-group">
            <div className="input-with-label">
              <label>🧑‍⚖️ 심사위원 가중치</label>
              <input
                type="number"
                name="judge"
                value={weights.judge}
                step="0.01"
                min="0"
                max="1"
                onChange={handleWeightChange}
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                현재: {(weights.judge * 100).toFixed(0)}%
              </small>
            </div>

            <div className="input-with-label">
              <label>👥 동료 평가 가중치</label>
              <input
                type="number"
                name="peer"
                value={weights.peer}
                step="0.01"
                min="0"
                max="1"
                onChange={handleWeightChange}
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                현재: {(weights.peer * 100).toFixed(0)}%
              </small>
            </div>

            <div className="input-with-label">
              <label>⭐ 가산점 가중치</label>
              <input
                type="number"
                name="bonus"
                value={weights.bonus}
                step="0.01"
                min="0"
                max="1"
                onChange={handleWeightChange}
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                현재: {(weights.bonus * 100).toFixed(0)}%
              </small>
            </div>
          </div>

          <div style={{ 
            padding: '1rem', 
            backgroundColor: isWeightValid ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            border: `1px solid ${isWeightValid ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <strong style={{ color: isWeightValid ? 'var(--success-color)' : 'var(--error-color)' }}>
              가중치 합계: {totalWeight.toFixed(2)}
            </strong>
            {!isWeightValid && (
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--error-color)' }}>
                가중치의 합이 1.0이 되어야 저장할 수 있습니다.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="secondary" 
              onClick={resetWeights}
              disabled={isSubmitting}
            >
              기본값 복원
            </button>
            <button 
              onClick={saveWeights} 
              disabled={isSubmitting || !isWeightValid}
            >
              {isSubmitting ? '저장 중...' : '가중치 저장'}
            </button>
          </div>
        </div>

        {/* 발표 순서 관리 */}
        <div className="card">
          <h3 className="section-title">🎤 발표 순서 관리</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            각 팀의 발표 순서를 설정합니다. 순서는 1번부터 시작합니다.
          </p>

          {teams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              등록된 팀이 없습니다.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <button 
                  type="button" 
                  className="secondary" 
                  onClick={autoAssignOrder}
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                >
                  🎲 순서 랜덤 배정
                </button>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>팀명</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>발표순서</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => (
                      <tr key={team.id}>
                        <td>
                          <div style={{ fontWeight: '600' }}>{team.name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Team ID: {team.id}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="number"
                            value={order[idx] || 0}
                            min="0"
                            max={teams.length}
                            onChange={e => handleOrderChange(idx, e.target.value)}
                            style={{ width: '80px', textAlign: 'center' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={saveOrder} 
                disabled={isSubmitting}
                style={{ width: '100%' }}
              >
                {isSubmitting ? '저장 중...' : '발표순서 저장'}
              </button>
            </>
          )}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`status-message ${msg.startsWith("에러") ? "status-error" : "status-success"}`}>
          {msg}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
