from dotenv import load_dotenv
import os

from pathlib import Path
env_path = Path('..') / '.env'
load_dotenv(dotenv_path=env_path)

url = os.getenv("DATABASE_URL")
if url:
    print(f"DATABASE_URL is set: {url.split('@')[1] if '@' in url else 'Invalid Format'}")
else:
    print("DATABASE_URL is NOT set. Using default.")
