import React from "react";
import EvaluationForm from "./components/EvaluationForm";
import useTeams from "./hooks/useTeams";
import "./App.css";

function AppWithForm({ user }) {
  const teams = useTeams();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📝 점수 입력</h1>
        <p className="page-subtitle">
          팀의 발표를 평가하고 점수를 입력해주세요
        </p>
      </div>
      <EvaluationForm teams={teams} user={user} />
    </div>
  );
}

export default AppWithForm;
