from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Link to Supabase Auth ID if needed
    supabase_uid = Column(String, unique=True, nullable=True)

    test_sessions = relationship("TestSession", back_populates="candidate")
    profiles = relationship("CandidateProfile", back_populates="candidate")

class PsychometricItem(Base):
    __tablename__ = "psych_items"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    trait = Column(String, nullable=False) # Openness, Conscientiousness, etc.
    keyed = Column(String, default="plus") # plus or minus (for reverse scoring)
    difficulty = Column(Float, default=0.0) # IRT parameter b
    discrimination = Column(Float, default=1.0) # IRT parameter a
    
    # For validity check items
    is_validity_check = Column(Boolean, default=False)
    validity_type = Column(String, nullable=True) # "lie_scale", "attention_check"

class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="in_progress") # in_progress, completed, abandoned
    
    # Current theta estimates (stored as JSON)
    current_theta = Column(JSON, nullable=True) 
    
    candidate = relationship("Candidate", back_populates="test_sessions")
    responses = relationship("ItemResponse", back_populates="session")

class ItemResponse(Base):
    __tablename__ = "item_responses"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("test_sessions.id"))
    item_id = Column(Integer, ForeignKey("psych_items.id"))
    response_value = Column(Integer) # 1-5
    response_time_ms = Column(Integer) # Biometrics: Dwell time
    mouse_trajectory_entropy = Column(Float, nullable=True) # Biometrics: Mouse movement chaos
    
    session = relationship("TestSession", back_populates="responses")
    item = relationship("PsychometricItem")

class JobProfile(Base):
    __tablename__ = "job_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Target scores (JSON)
    # e.g. {"Openness": {"min": 40, "max": 60, "weight": 0.5}, ...}
    target_profile = Column(JSON, nullable=False)

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    session_id = Column(Integer, ForeignKey("test_sessions.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Final Calculated Scores
    scores = Column(JSON, nullable=False) # {"Openness": 85, "IQ_Logic": 110, ...}
    validity_flags = Column(JSON, nullable=True) # {"lie_detected": true, ...}
    
    candidate = relationship("Candidate", back_populates="profiles")
