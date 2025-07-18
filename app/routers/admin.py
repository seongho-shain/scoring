from fastapi import APIRouter, HTTPException
from app.models.supabase import supabase

router = APIRouter()

@router.post("/admin/weights/")
def set_weights(weights: dict):
    # 예시: weights = {"judge": 0.6, "peer": 0.3, "bonus": 0.1}
    # 실제로는 별도 테이블에 저장하는 것이 바람직
    # 여기서는 환경설정 테이블이 없으므로 임시로 scores 테이블의 첫 row에 저장(데모)
    # 실제 운영시 별도 config 테이블 설계 필요
    try:
        supabase.table("scores").update({"judge_weight": weights["judge"], "peer_weight": weights["peer"], "bonus_weight": weights["bonus"]}).eq("id", 1).execute()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/presentation_order/")
def set_presentation_order(order: list):
    # order = [{"team_id": 1, "presentation_order": 1}, ...]
    try:
        for item in order:
            supabase.table("teams").update({"presentation_order": item["presentation_order"]}).eq("id", item["team_id"]).execute()
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
