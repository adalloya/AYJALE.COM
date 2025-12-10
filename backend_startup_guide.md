# Backend Startup Guide

The 500 Internal Server Errors in the Evaluation Center occur because the Python backend API is not running.
Follow these steps to start it.

## 1. Prerequisites
Ensure you have Python installed (`python3 --version`).

## 2. Setup (First Time Only)
Open a **new terminal** window, navigate to the `backend` folder, and install dependencies.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

*Note: If `requirements.txt` is missing specific packages, install them manually:*
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic moviepy openai
```

## 3. Start the Server
Run the following command in the `backend` directory:

```bash
uvicorn app.main:app --reload --port 8000
```

You should see output indicating the server is running at `http://127.0.0.1:8000`.

## 4. Verify
Open http://localhost:8000/docs in your browser. You should see the API Swagger documentation.

## 5. Environment Variables
Ensure your root `.env` file contains the correct `DATABASE_URL` pointing to your Supabase DB.
Example:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```
*If running locally with Supabase CLI:*
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```
