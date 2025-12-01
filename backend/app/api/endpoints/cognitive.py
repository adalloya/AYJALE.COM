from fastapi import APIRouter, HTTPException
from app.engines.cognitive import CognitiveEngine
import random

router = APIRouter()
engine = CognitiveEngine()

@router.get("/generate")
def generate_puzzle(type: str, difficulty: int = 1):
    if type == "abstract":
        puzzle = engine.generate_abstract_matrix(difficulty)
    elif type == "numerical":
        puzzle = engine.generate_numerical_series(difficulty)
    elif type == "verbal":
        puzzle = engine.generate_verbal_syllogism(difficulty)
    else:
        raise HTTPException(status_code=400, detail="Invalid puzzle type")
    
    # Shuffle options
    options = puzzle["options"]
    correct_option = options[puzzle["correct_index"]]
    random.shuffle(options)
    puzzle["correct_index"] = options.index(correct_option)
    
    return puzzle
