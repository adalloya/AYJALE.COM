from sqlalchemy.orm import Session
from app.models import CandidateProfile, JobProfile
import json

class MatchmakerEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_fit(self, candidate_id: int, job_profile_id: int):
        """
        Calculates the % fit between a candidate and a job.
        """
        # Get Candidate Profile (Latest)
        # In real app, we might want to average multiple sessions or pick the best.
        profile = self.db.query(CandidateProfile).filter(
            CandidateProfile.candidate_id == candidate_id
        ).order_by(CandidateProfile.created_at.desc()).first()
        
        job = self.db.query(JobProfile).filter(JobProfile.id == job_profile_id).first()
        
        if not profile or not job:
            return {"error": "Profile or Job not found"}
            
        candidate_scores = profile.scores # JSON
        target_scores = job.target_profile # JSON
        
        total_weighted_gap = 0
        total_possible_weight = 0
        
        details = {}
        
        # Iterate through target traits (OCEAN, IQ, etc.)
        for trait, target in target_scores.items():
            # target structure: {"min": 40, "max": 60, "ideal": 50, "weight": 1.0}
            # or simplified: {"ideal": 80, "weight": 2.0}
            
            ideal = target.get("ideal", 50)
            weight = target.get("weight", 1.0)
            
            candidate_val = candidate_scores.get(trait, 50) # Default to average if missing
            
            # Calculate Gap
            gap = abs(candidate_val - ideal)
            
            # Weighted Penalty
            # If gap is 0, penalty is 0. If gap is 100, penalty is max.
            weighted_gap = gap * weight
            
            total_weighted_gap += weighted_gap
            total_possible_weight += (100 * weight)
            
            details[trait] = {
                "candidate": candidate_val,
                "ideal": ideal,
                "gap": gap,
                "status": "green" if gap < 10 else "yellow" if gap < 20 else "red"
            }
            
        # Calculate Fit %
        # 100% - (Total Gap / Max Possible Gap)
        # Max Possible Gap is if candidate is 0 and ideal is 100 (gap 100) for all traits.
        
        if total_possible_weight == 0:
            fit_percentage = 0
        else:
            fit_percentage = 100 - (total_weighted_gap / total_possible_weight * 100)
            
        # Boost curve (to make scores look more normal, like grades)
        # Raw 80% is actually excellent match.
        fit_percentage = min(100, fit_percentage * 1.1)
        
        return {
            "fit_score": round(fit_percentage, 1),
            "details": details,
            "recommendation": "Highly Recommended" if fit_percentage > 85 else "Recommended" if fit_percentage > 70 else "Not Recommended"
        }
