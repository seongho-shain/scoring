from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.evaluation import EvaluationSchema, EvaluationUpdateSchema

router = APIRouter()

# 임시 메모리 저장소 (실제 구현시 DB 연동 필요)
evaluations_db = []

@router.post("/evaluations/", response_model=EvaluationSchema)
def create_evaluation(evaluation: EvaluationSchema):
    # 중복 입력 방지 (user_id, team_id, evaluator_type)
    for e in evaluations_db:
        if (e.user_id == evaluation.user_id and e.team_id == evaluation.team_id and e.evaluator_type == evaluation.evaluator_type):
            raise HTTPException(status_code=400, detail="이미 평가가 존재합니다.")
    evaluations_db.append(evaluation)
    return evaluation

@router.get("/evaluations/", response_model=List[EvaluationSchema])
def list_evaluations():
    return evaluations_db

@router.patch("/evaluations/{user_id}/{team_id}/{evaluator_type}", response_model=EvaluationSchema)
def update_evaluation(user_id: int, team_id: int, evaluator_type: str, update: EvaluationUpdateSchema):
    for e in evaluations_db:
        if (e.user_id == user_id and e.team_id == team_id and e.evaluator_type == evaluator_type):
            update_data = update.dict(exclude_unset=True)
            for k, v in update_data.items():
                setattr(e, k, v)
            return e
    raise HTTPException(status_code=404, detail="평가를 찾을 수 없습니다.")
