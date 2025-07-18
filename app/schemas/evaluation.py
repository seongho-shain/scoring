from pydantic import BaseModel
from typing import Optional

class EvaluationSchema(BaseModel):
    team_id: int
    user_id: int
    evaluator_type: str  # 'judge' or 'peer'
    creativity: int
    impact: int
    completeness: int
    presentation: int
    bonus: Optional[int] = 0
    submitted: Optional[bool] = False

class EvaluationUpdateSchema(BaseModel):
    creativity: Optional[int]
    impact: Optional[int]
    completeness: Optional[int]
    presentation: Optional[int]
    bonus: Optional[int]
    submitted: Optional[bool]
