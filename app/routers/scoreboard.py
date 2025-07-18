from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.models.supabase import supabase

router = APIRouter()

# 관리자 가중치 설정 예시 (실제 구현시 DB 또는 환경변수로 관리)
WEIGHTS = {
    'judge': 0.6,
    'peer': 0.3,
    'bonus': 0.1
}

@router.get("/scoreboard/")
def get_scoreboard():
    # 모든 팀 목록
    teams = supabase.table("teams").select("id, name, presentation_order").execute().data
    # 모든 평가 데이터
    evaluations = supabase.table("evaluations").select("*").execute().data

    # 팀별 점수 집계
    scoreboard = []
    for team in teams:
        team_id = team['id']
        team_evals = [e for e in evaluations if e['team_id'] == team_id]
        judge_scores = [e for e in team_evals if e['evaluator_type'] == 'judge']
        peer_scores = [e for e in team_evals if e['evaluator_type'] == 'peer']
        # 각 항목별 평균
        def avg(scores, key):
            return sum(e.get(key, 0) for e in scores) / len(scores) if scores else 0
        creativity = WEIGHTS['judge'] * avg(judge_scores, 'creativity') + WEIGHTS['peer'] * avg(peer_scores, 'creativity')
        impact = WEIGHTS['judge'] * avg(judge_scores, 'impact') + WEIGHTS['peer'] * avg(peer_scores, 'impact')
        completeness = WEIGHTS['judge'] * avg(judge_scores, 'completeness') + WEIGHTS['peer'] * avg(peer_scores, 'completeness')
        presentation = WEIGHTS['judge'] * avg(judge_scores, 'presentation') + WEIGHTS['peer'] * avg(peer_scores, 'presentation')
        bonus = sum(e.get('bonus', 0) for e in team_evals) * WEIGHTS['bonus']
        total = creativity + impact + completeness + presentation + bonus
        scoreboard.append({
            'team_id': team_id,
            'team_name': team['name'],
            'presentation_order': team.get('presentation_order'),
            'creativity': creativity,
            'impact': impact,
            'completeness': completeness,
            'presentation': presentation,
            'bonus': bonus,
            'total': total
        })
    # 발표순서, 총점순 정렬
    scoreboard.sort(key=lambda x: (x['presentation_order'] if x['presentation_order'] is not None else 999, -x['total']))
    return scoreboard
