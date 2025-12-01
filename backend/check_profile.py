from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL
import json

engine = create_engine(SQLALCHEMY_DATABASE_URL)

with engine.connect() as conn:
    print("--- Checking Test Sessions ---")
    result = conn.execute(text("SELECT * FROM test_sessions ORDER BY start_time DESC LIMIT 5"))
    sessions = result.fetchall()
    if sessions:
        for s in sessions:
            print(f"Session ID: {s.id}, Candidate: {s.candidate_id}, Status: {s.status}, Created: {s.start_time}")
    else:
        print("❌ No test sessions found.")

    print("\n--- Checking Candidate Profiles ---")
    result = conn.execute(text("SELECT * FROM candidate_profiles ORDER BY created_at DESC LIMIT 5"))
    profiles = result.fetchall()
    if profiles:
        for p in profiles:
            print(f"Profile ID: {p.id}, Session: {p.session_id}, Created: {p.created_at}")
    else:
        print("❌ No candidate profiles found.")
