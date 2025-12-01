from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.engines.psychometric import PsychometricEngine
from app import schemas, models

router = APIRouter()

@router.post("/candidates/", response_model=dict)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = models.Candidate(email=candidate.email, full_name=candidate.full_name)
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return {"id": db_candidate.id, "email": db_candidate.email}

@router.post("/sessions/start", response_model=schemas.SessionResponse)
def start_session(request: schemas.SessionCreate, db: Session = Depends(get_db)):
    engine = PsychometricEngine(db)
    # Ensure data is loaded
    engine.load_ipip_data()
    
    session = engine.initialize_session(request.candidate_id)
    return {
        "session_id": session.id,
        "candidate_id": session.candidate_id,
        "status": session.status
    }

@router.get("/sessions/{session_id}/next_item", response_model=Optional[schemas.QuestionResponse])
def get_next_item(session_id: int, db: Session = Depends(get_db)):
    engine = PsychometricEngine(db)
    item = engine.get_next_item(session_id)
    
    if not item:
        return None # Test finished
        
    return {
        "id": item.id,
        "text": item.text,
        "trait": item.trait
    }

@router.post("/sessions/submit", response_model=schemas.SubmitAnswerResponse)
def submit_answer(request: schemas.SubmitAnswerRequest, db: Session = Depends(get_db)):
    engine = PsychometricEngine(db)
    success = engine.submit_response(
        request.session_id, 
        request.item_id, 
        request.value, 
        request.time_ms
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Invalid session or item")
        
    return {"success": True}
