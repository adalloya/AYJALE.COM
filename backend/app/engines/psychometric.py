import json
import os
import random
import numpy as np
from sqlalchemy.orm import Session
from app.models import PsychometricItem, TestSession, ItemResponse

# Since we don't have real IRT calibration for these specific IPIP items in the prompt,
# we will simulate parameters for the "God-Tier" demo.
# In a real scenario, these would come from the database after calibration.

class PsychometricEngine:
    def __init__(self, db: Session):
        self.db = db

    def initialize_session(self, candidate_id: int):
        """Starts a new CAT session for a candidate."""
        # Create session in DB
        session = TestSession(candidate_id=candidate_id, current_theta={
            "Openness": 0.0,
            "Conscientiousness": 0.0,
            "Extraversion": 0.0,
            "Agreeableness": 0.0,
            "Neuroticism": 0.0
        })
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_next_item(self, session_id: int):
        """
        Selects the next item based on current theta (Adaptive).
        For this MVP, we pick a random item that hasn't been answered yet
        for the trait with the least information or round-robin.
        """
        session = self.db.query(TestSession).filter(TestSession.id == session_id).first()
        if not session:
            return None

        # Get answered items
        answered_ids = [r.item_id for r in session.responses]

        # Find available items
        available_items = self.db.query(PsychometricItem).filter(
            PsychometricItem.id.notin_(answered_ids)
        ).all()

        if not available_items:
            return None # Test finished

        # Simple Adaptive Logic:
        # In a full implementation, we would calculate Fisher Information here.
        # For now, we just pick the next available item to ensure coverage.
        # We prioritize Validity Checks if they haven't appeared.
        
        # Check for validity items first
        validity_items = [i for i in available_items if i.is_validity_check]
        if validity_items and random.random() < 0.2: # 20% chance to insert a trap
            return random.choice(validity_items)

        # Otherwise pick a random trait item
        return random.choice(available_items)

    def submit_response(self, session_id: int, item_id: int, value: int, time_ms: int):
        """
        Saves response and updates Theta (Score).
        """
        session = self.db.query(TestSession).filter(TestSession.id == session_id).first()
        item = self.db.query(PsychometricItem).filter(PsychometricItem.id == item_id).first()
        
        if not session or not item:
            return False

        # Save Response
        response = ItemResponse(
            session_id=session_id,
            item_id=item_id,
            response_value=value,
            response_time_ms=time_ms
        )
        self.db.add(response)
        
        # Update Theta (Simplified EAP/MAP estimation)
        # 1. Reverse score if needed
        score = value
        if item.keyed == "minus":
            score = 6 - value # 1->5, 5->1
        
        # 2. Update running average for the trait (Simplified)
        # In real IRT, we would maximize likelihood.
        current_thetas = dict(session.current_theta) if session.current_theta else {}
        trait = item.trait
        
        # Get all responses for this trait
        trait_responses = [r for r in session.responses if r.item.trait == trait]
        trait_responses.append(response) # Add current one
        
        # Calculate simple average (normalized -2 to +2 for Theta)
        # Likert 1-5 -> -2, -1, 0, 1, 2
        scores = []
        for r in trait_responses:
            val = r.response_value
            if r.item.keyed == "minus":
                val = 6 - val
            scores.append(val)
        
        avg_score = sum(scores) / len(scores)
        # Map 1..5 to -2..2 roughly
        theta = (avg_score - 3) * 1.5 
        
        current_thetas[trait] = theta
        session.current_theta = current_thetas
        
        self.db.commit()
        return True

    def load_ipip_data(self):
        """Loads the JSON data into the DB if empty."""
        count = self.db.query(PsychometricItem).count()
        if count > 0:
            return # Already loaded

        json_path = os.path.join(os.path.dirname(__file__), "../data/ipip50.json")
        with open(json_path, "r") as f:
            items = json.load(f)
            
        for i in items:
            db_item = PsychometricItem(
                text=i["text"],
                trait=i["trait"],
                keyed=i.get("keyed", "plus"),
                is_validity_check=i.get("is_validity", False),
                validity_type="lie_scale" if i.get("is_validity") else None
            )
            self.db.add(db_item)
        self.db.commit()
