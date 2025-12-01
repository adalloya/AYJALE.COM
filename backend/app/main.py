from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Talent Intelligence API",
    description="API for Psychometric, Cognitive, and Language Assessments",
    version="1.0.0",
)

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.endpoints import psychometric, cognitive, language, matchmaker, results

app.include_router(psychometric.router, prefix="/api/v1", tags=["psychometric"])
app.include_router(cognitive.router, prefix="/api/v1/cognitive", tags=["cognitive"])
app.include_router(language.router, prefix="/api/v1/language", tags=["language"])
app.include_router(matchmaker.router, prefix="/api/v1/matchmaker", tags=["matchmaker"])
app.include_router(results.router, prefix="/api/v1/results", tags=["results"])

@app.get("/")
async def root():
    return {"message": "Talent Intelligence API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
