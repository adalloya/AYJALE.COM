from pydantic import BaseModel
from typing import Optional, Dict, Any

class CandidateCreate(BaseModel):
    full_name: str
    email: str

class SessionCreate(BaseModel):
    candidate_id: int

class SessionResponse(BaseModel):
    session_id: int
    candidate_id: int
    status: str

class QuestionResponse(BaseModel):
    id: int
    text: str
    trait: str
    # We don't send 'keyed' or 'validity' info to frontend to prevent cheating

class SubmitAnswerRequest(BaseModel):
    session_id: int
    item_id: int
    value: int # 1-5
    time_ms: int

class SubmitAnswerResponse(BaseModel):
    success: bool
    next_item_id: Optional[int] = None
