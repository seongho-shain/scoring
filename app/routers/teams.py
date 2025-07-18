from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from app.models.supabase import supabase

router = APIRouter()

class TeamCreate(BaseModel):
    name: str
    presentation_order: int = None

class TeamUpdate(BaseModel):
    name: str = None
    presentation_order: int = None

class TeamBulkCreate(BaseModel):
    team_names: List[str]

@router.get("/teams/")
def get_teams():
    try:
        teams = supabase.table("teams").select("id, name, presentation_order").order("presentation_order").execute().data
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/teams/")
def create_team(team: TeamCreate):
    try:
        result = supabase.table("teams").insert({
            "name": team.name,
            "presentation_order": team.presentation_order
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/teams/bulk/")
def create_teams_bulk(teams_data: TeamBulkCreate):
    try:
        # 기존 팀들 삭제 (선택사항 - 필요에 따라 주석 해제)
        # supabase.table("teams").delete().neq("id", 0).execute()
        
        # 새 팀들 생성
        teams_to_insert = []
        for idx, team_name in enumerate(teams_data.team_names, 1):
            if team_name.strip():  # 빈 문자열이 아닌 경우만
                teams_to_insert.append({
                    "name": team_name.strip(),
                    "presentation_order": idx
                })
        
        if not teams_to_insert:
            raise HTTPException(status_code=400, detail="등록할 팀이 없습니다.")
        
        result = supabase.table("teams").insert(teams_to_insert).execute()
        return {"message": f"{len(result.data)}개 팀이 등록되었습니다.", "teams": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/teams/{team_id}")
def update_team(team_id: int, team: TeamUpdate):
    try:
        update_data = team.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="수정할 데이터가 없습니다.")
        
        result = supabase.table("teams").update(update_data).eq("id", team_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="팀을 찾을 수 없습니다.")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/teams/{team_id}")
def delete_team(team_id: int):
    try:
        # 해당 팀의 평가 데이터도 함께 삭제
        supabase.table("evaluations").delete().eq("team_id", team_id).execute()
        
        result = supabase.table("teams").delete().eq("id", team_id).execute()
        return {"message": "팀이 삭제되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/teams/")
def delete_all_teams():
    try:
        # 모든 평가 데이터 삭제
        supabase.table("evaluations").delete().neq("id", 0).execute()
        
        # 모든 팀 삭제
        result = supabase.table("teams").delete().neq("id", 0).execute()
        return {"message": "모든 팀이 삭제되었습니다."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
