from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TestSession, ItemResponse, CandidateProfile, PsychometricItem
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class ProfileRequest(BaseModel):
    session_id: int
    cognitive_score: int
    language_analysis: Dict[str, Any]

@router.post("/generate")
def generate_profile(request: ProfileRequest, db: Session = Depends(get_db)):
    # 1. Get Session
    session = db.query(TestSession).filter(TestSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # 2. Calculate Psychometric Scores (Big 5)
    # Fetch all responses
    responses = db.query(ItemResponse).filter(ItemResponse.session_id == request.session_id).all()
    
    scores = {
        "Openness": [],
        "Conscientiousness": [],
        "Extraversion": [],
        "Agreeableness": [],
        "Neuroticism": []
    }
    
    for r in responses:
        item = db.query(PsychometricItem).filter(PsychometricItem.id == r.item_id).first()
        if item and item.trait in scores:
            val = r.response_value
            if item.keyed == "minus":
                val = 6 - val
            scores[item.trait].append(val)
            
    # Average and Normalize (0-100)
    final_psych_scores = {}
    for trait, values in scores.items():
        if values:
            avg = sum(values) / len(values)
            # Map 1-5 to 0-100
            # 1=0, 5=100 -> (val-1)*25
            final_psych_scores[trait] = round((avg - 1) * 25)
        else:
            final_psych_scores[trait] = 50 # Default
            
    # 3. Combine Scores
    final_scores = {
        **final_psych_scores,
        "Logic_Reasoning": request.cognitive_score * 10, # Assuming score is 0-10, map to 0-100
        "English_Level": request.language_analysis.get("analysis", {}).get("estimated_cefr", "B1")
    }
    
    # 4. Save Profile
    profile = CandidateProfile(
        candidate_id=session.candidate_id,
        session_id=session.id,
        scores=final_scores
    )
    db.add(profile)
    
    # Update Session Status
    session.status = "completed"
    session.end_time = "now()" # SQLAlchemy will handle timestamp if configured, or use datetime.now()
    
    db.commit()
    db.refresh(profile)
    
    return {
        "profile_id": profile.id,
        "scores": final_scores
    }
