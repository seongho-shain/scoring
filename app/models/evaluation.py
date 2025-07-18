from pydantic import BaseModel
from typing import Optional

class EvaluationBase(BaseModel):
    team_id: int
    user_id: int
    evaluator_type: str  # 'judge' or 'peer'
    creativity: int
    impact: int
    completeness: int
    presentation: int
    bonus: Optional[int] = 0
    submitted: Optional[bool] = False

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationUpdate(BaseModel):
    creativity: Optional[int]
    impact: Optional[int]
    completeness: Optional[int]
    presentation: Optional[int]
    bonus: Optional[int]
    submitted: Optional[bool]

class EvaluationInDB(EvaluationBase):
    id: int

    class Config:
        orm_mode = True
