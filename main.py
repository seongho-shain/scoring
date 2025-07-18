from fastapi import FastAPI


from app.routers import items, evaluation, evaluation_db, scoreboard, teams, admin, auth

app = FastAPI()


app.include_router(items.router)
app.include_router(evaluation.router)
app.include_router(evaluation_db.router)
app.include_router(scoreboard.router)
app.include_router(teams.router)
app.include_router(admin.router)
app.include_router(auth.router)  # ← 반드시 추가!

@app.get("/")
async def root():
    return {"message": "Hello World"}