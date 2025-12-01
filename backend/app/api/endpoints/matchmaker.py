from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.engines.matchmaker import MatchmakerEngine
from app import models

router = APIRouter()

@router.get("/analyze/fit")
def analyze_fit(candidate_id: int, job_id: int, db: Session = Depends(get_db)):
    engine = MatchmakerEngine(db)
    result = engine.calculate_fit(candidate_id, job_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/jobs/seed")
def seed_job_profiles(db: Session = Depends(get_db)):
    # Create default profiles if they don't exist
    jobs = [
        {
            "title": "Sales Hunter",
            "target_profile": {
                "Openness": {"ideal": 40, "weight": 0.5},
                "Conscientiousness": {"ideal": 95, "weight": 2.0},
                "Extraversion": {"ideal": 85, "weight": 1.5},
                "Agreeableness": {"ideal": 30, "weight": 1.0},
                "Neuroticism": {"ideal": 10, "weight": 2.0} # Low Neuroticism = High Stability
            }
        },
        {
            "title": "Software Engineer",
            "target_profile": {
                "Openness": {"ideal": 80, "weight": 1.5},
                "Conscientiousness": {"ideal": 70, "weight": 1.0},
                "Extraversion": {"ideal": 40, "weight": 0.5},
                "Agreeableness": {"ideal": 60, "weight": 1.0},
                "Neuroticism": {"ideal": 20, "weight": 1.0}
            }
        }
    ]
    
    created = []
    for j in jobs:
        exists = db.query(models.JobProfile).filter(models.JobProfile.title == j["title"]).first()
        if not exists:
            job = models.JobProfile(title=j["title"], target_profile=j["target_profile"])
            db.add(job)
            created.append(j["title"])
            
    db.commit()
    return {"created": created}
