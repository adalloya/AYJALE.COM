from fastapi import APIRouter, UploadFile, File, HTTPException
from app.engines.language import LanguageEngine
import shutil
import os
import tempfile

router = APIRouter()
engine = LanguageEngine()

@router.post("/analyze/audio")
async def analyze_audio(file: UploadFile = File(...)):
    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    
    try:
        result = engine.analyze_audio(tmp_path)
    except Exception as e:
        print(f"Audio analysis failed: {e}")
        # Fallback for demo if FFmpeg is missing
        result = {
            "transcription": "(Simulación) I listened to the client's concerns and proposed a solution that addressed their immediate needs while managing expectations.",
            "analysis": {
                "word_count": 25,
                "unique_words": 20,
                "lexical_diversity": 0.8,
                "estimated_cefr": "B2"
            },
            "warning": "FFmpeg missing. Using simulated analysis."
        }
    
    if os.path.exists(tmp_path):
        os.unlink(tmp_path)
    return result

@router.get("/sjt/generate")
def generate_sjt():
    return engine.generate_sjt_scenario()
