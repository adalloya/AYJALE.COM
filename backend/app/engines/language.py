import spacy
import whisper
import os
import random

# Load Spacy model (assuming en_core_web_sm is installed in Docker)
# If not, we handle the error or download it.
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback or download
    # os.system("python -m spacy download en_core_web_sm")
    # nlp = spacy.load("en_core_web_sm")
    nlp = None

# Load Whisper model (lazy loading to save startup time)
whisper_model = None

class LanguageEngine:
    def __init__(self):
        pass

    def _load_whisper(self):
        global whisper_model
        if whisper_model is None:
            # Use "tiny" or "base" for speed in this demo
            whisper_model = whisper.load_model("tiny")
        return whisper_model

    def analyze_audio(self, audio_path: str):
        """
        Transcribes audio and analyzes fluency.
        """
        model = self._load_whisper()
        result = model.transcribe(audio_path)
        text = result["text"]
        
        # Basic Fluency Metrics
        # WPM (Words Per Minute) - simplified
        # We would need audio duration from ffmpeg or the file metadata
        # For now, let's just return the text and a mock score
        
        analysis = self.analyze_text(text)
        
        return {
            "transcription": text,
            "analysis": analysis
        }

    def analyze_text(self, text: str):
        """
        Analyzes vocabulary richness and grammar using Spacy.
        """
        if not nlp:
            return {"error": "Spacy model not loaded"}
            
        doc = nlp(text)
        
        # Lexical Diversity (Unique words / Total words)
        words = [token.text.lower() for token in doc if token.is_alpha]
        if not words:
            return {"level": "A1", "diversity": 0}
            
        unique_words = set(words)
        diversity = len(unique_words) / len(words)
        
        # Estimate CEFR Level based on diversity and length (Heuristic)
        if diversity > 0.8 and len(words) > 50:
            level = "C2"
        elif diversity > 0.7:
            level = "C1"
        elif diversity > 0.6:
            level = "B2"
        elif diversity > 0.5:
            level = "B1"
        else:
            level = "A2"
            
        return {
            "word_count": len(words),
            "unique_words": len(unique_words),
            "lexical_diversity": diversity,
            "estimated_cefr": level
        }

    def generate_sjt_scenario(self):
        """
        Generates a Situational Judgment Test scenario.
        """
        scenarios = [
            {
                "id": "sjt_1",
                "context": "You are a Project Manager. A key stakeholder demands a feature change 2 days before launch.",
                "question": "What do you do?",
                "options": [
                    {"text": "Accept the change immediately to please them.", "score": {"Agreeableness": 5, "Assertiveness": 1}},
                    {"text": "Refuse flatly citing the deadline.", "score": {"Agreeableness": 1, "Assertiveness": 5}},
                    {"text": "Explain the risk and offer to implement it in Phase 2.", "score": {"Agreeableness": 4, "Assertiveness": 4}},
                    {"text": "Ignore the request until after launch.", "score": {"Agreeableness": 2, "Assertiveness": 2}}
                ]
            },
            {
                "id": "sjt_2",
                "context": "A team member is consistently late to meetings.",
                "question": "How do you handle it?",
                "options": [
                    {"text": "Publicly reprimand them.", "score": {"Leadership": 2, "Empathy": 1}},
                    {"text": "Talk to them privately to understand the cause.", "score": {"Leadership": 5, "Empathy": 5}},
                    {"text": "Ignore it as long as they do their work.", "score": {"Leadership": 1, "Empathy": 3}},
                    {"text": "Report them to HR immediately.", "score": {"Leadership": 3, "Empathy": 1}}
                ]
            }
        ]
        return random.choice(scenarios)
