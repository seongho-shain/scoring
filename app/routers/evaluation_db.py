from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.evaluation import EvaluationSchema, EvaluationUpdateSchema
from app.models.supabase import supabase

router = APIRouter()

def evaluation_row_to_schema(row):
    return EvaluationSchema(
        team_id=row['team_id'],
        user_id=row['user_id'],
        evaluator_type=row['evaluator_type'],
        creativity=row['creativity'],
        impact=row['impact'],
        completeness=row['completeness'],
        presentation=row['presentation'],
        bonus=row.get('bonus', 0),
        submitted=row.get('submitted', False)
    )

@router.post("/evaluations/", response_model=EvaluationSchema)
def create_evaluation(evaluation: EvaluationSchema):
    # 중복 입력 방지
    query = supabase.table("evaluations").select("*").eq("user_id", evaluation.user_id).eq("team_id", evaluation.team_id).eq("evaluator_type", evaluation.evaluator_type)
    if query.execute().data:
        raise HTTPException(status_code=400, detail="이미 평가가 존재합니다.")
    data = supabase.table("evaluations").insert(evaluation.dict()).execute().data[0]
    return evaluation_row_to_schema(data)

@router.get("/evaluations/", response_model=List[EvaluationSchema])
def list_evaluations():
    rows = supabase.table("evaluations").select("*").execute().data
    return [evaluation_row_to_schema(row) for row in rows]

@router.patch("/evaluations/{user_id}/{team_id}/{evaluator_type}", response_model=EvaluationSchema)
def update_evaluation(user_id: int, team_id: int, evaluator_type: str, update: EvaluationUpdateSchema):
    query = supabase.table("evaluations").select("*").eq("user_id", user_id).eq("team_id", team_id).eq("evaluator_type", evaluator_type)
    rows = query.execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="평가를 찾을 수 없습니다.")
    update_data = update.dict(exclude_unset=True)
    data = supabase.table("evaluations").update(update_data).eq("user_id", user_id).eq("team_id", team_id).eq("evaluator_type", evaluator_type).execute().data[0]
    return evaluation_row_to_schema(data)
