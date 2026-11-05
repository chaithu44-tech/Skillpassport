import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.config import settings
from backend.database import engine, Base, SessionLocal
from backend.initial_data import seed_database
from backend.routes.auth_routes import router as auth_router
from backend.routes.student_routes import router as student_router
from backend.routes.opportunity_routes import router as opportunity_router
from backend.routes.recruiter_routes import router as recruiter_router
from backend.routes.admin_routes import router as admin_router
from backend.routes.notification_routes import router as notification_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if not present
    Base.metadata.create_all(bind=engine)
    # Seed career roles, opportunities, settings and bootstrap owner
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SKILL PASSPORT - AI-Powered Career Intelligence Platform",
    description="Modern, responsive platform empowering college students with resume intelligence, role compatibility, and personalized roadmaps.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API V1 Routers
api_v1 = f"{settings.API_V1_STR}"
app.include_router(auth_router, prefix=api_v1)
app.include_router(student_router, prefix=api_v1)
app.include_router(opportunity_router, prefix=api_v1)
app.include_router(recruiter_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)
app.include_router(notification_router, prefix=api_v1)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": f"Gemini ({settings.AI_MODEL})" if settings.AI_API_KEY else "Local Semantic Parser (Dev Mode)"
    }

# Mount static assets
frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

    @app.get("/download")
    @app.get("/skill-passport.zip")
    @app.get("/download/skill-passport.zip")
    async def download_repo_archive():
        zip_file = frontend_dir / "skill-passport.zip"
        if zip_file.exists():
            return FileResponse(
                str(zip_file),
                media_type="application/zip",
                filename="skill-passport-complete-project.zip"
            )
        return JSONResponse(status_code=404, content={"detail": "Archive not found."})

    # SPA Fallback - serve index.html for non-API routes
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not catch API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        index_file = frontend_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return JSONResponse(status_code=404, content={"detail": "Frontend index.html not found."})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
