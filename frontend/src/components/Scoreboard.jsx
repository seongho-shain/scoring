import React, { useEffect, useState } from "react";

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("/scoreboard/");
        const data = await res.json();
        setScores(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("점수 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScores();
    const interval = setInterval(fetchScores, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return "rank-badge rank-1";
    if (rank === 2) return "rank-badge rank-2";
    if (rank === 3) return "rank-badge rank-3";
    return "rank-badge rank-other";
  };

  const formatScore = (score) => {
    return typeof score === 'number' ? score.toFixed(1) : '0.0';
  };

  if (loading) {
    return (
      <div className="section">
        <div className="page-header">
          <h2 className="section-title">실시간 점수판</h2>
          <p className="page-subtitle">점수를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="page-header">
        <h2 className="section-title">🏆 실시간 점수판</h2>
        <p className="page-subtitle">
          마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          <span style={{ marginLeft: '1rem', color: 'var(--success-color)' }}>
            ● 5초마다 자동 갱신
          </span>
        </p>
      </div>

      {scores.length === 0 ? (
        <div className="card text-center">
          <h3>아직 등록된 점수가 없습니다</h3>
          <p className="text-secondary">팀들의 발표 점수가 입력되면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>순위</th>
                  <th style={{ minWidth: '150px' }}>팀명</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>창의력</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>파급력</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>완성도</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>발표점수</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>가산점</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>총점</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((team, idx) => (
                  <tr key={team.team_id || idx}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={getRankBadgeClass(idx + 1)}>
                        {idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                        {team.team_name || `팀 ${team.team_id}`}
                      </div>
                      {team.presentation_order && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          발표순서: {team.presentation_order}번
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-cell">{formatScore(team.creativity)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-cell">{formatScore(team.impact)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-cell">{formatScore(team.completeness)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-cell">{formatScore(team.presentation)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-cell">{formatScore(team.bonus)}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="total-score">{formatScore(team.total)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {scores.length > 0 && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              backgroundColor: 'var(--background)', 
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>📊 총 {scores.length}개 팀 참가</div>
                <div>🥇 1위: {scores[0]?.team_name} ({formatScore(scores[0]?.total)}점)</div>
                <div>⏱️ 실시간 업데이트 중</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Scoreboard;
