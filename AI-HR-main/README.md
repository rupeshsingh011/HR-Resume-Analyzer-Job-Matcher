# Smart HR Resume Analyzer & Job Matcher

Modern full-stack HR application for parsing resumes, extracting structured candidate data, analyzing candidate strengths, and ranking candidates against job descriptions.

## Stack

- Frontend: React, Vite, Tailwind CSS, Recharts, Lucide icons
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT with Admin / HR roles
- Uploads: Multer with PDF and DOCX support
- AI/NLP: OpenAI optional for resume parsing, deterministic fallback included
- Matc
hing: Weighted score using skills, experience, education, and keyword similarity

## Features

- Login and registration for HR users
- Resume upload in PDF/DOCX format
- Resume text extraction and structured candidate storage
- AI-ready parsing and candidate insights
- Job description management
- Candidate-to-job matching with score breakdown
- Dashboard filters for skills, experience, and match score
- Candidate profile with strengths, gaps, best-fit roles, and shortlist action
- Analytics for common skills, candidate distribution, and shortlist count
- Candidate ranking per job via API
- Exportable candidate report

## Matching Formula

The backend computes a 0-100 score using:

- Skill overlap: 40%
- Experience relevance: 30%
- Education fit: 10%
- Keyword similarity: 20%

The implementation lives in `backend/src/services/matchingService.js`.

## API Endpoints

Base URL: `http://localhost:5000/api`

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /candidates`
- `POST /candidates/upload`
- `GET /candidates/:id`
- `PATCH /candidates/:id/shortlist`
- `POST /candidates/:id/rematch`
- `GET /candidates/:id/report`
- `GET /jobs`
- `POST /jobs`
- `GET /jobs/:id/rankings`
- `GET /analytics`

## Local Setup

1. **Install dependencies**:

   ```bash
   npm run install:all
   ```

2. **Configure Environment**:
   - Backend: Copy `backend/.env.example` to `backend/.env` and fill in your `MONGO_URI` and `JWT_SECRET`.
   - Frontend: Copy `frontend/.env.example` to `frontend/.env` and ensure `VITE_API_URL` points to your backend.

3. **Database Setup**:
   - **Option A (Cloud)**: Configure **MongoDB Atlas** in `backend/.env` ([full guide](docs/ATLAS_SETUP.md)).
   - **Option B (Local/Dev)**: You can run the backend with an in-memory database using `npm run dev:memory --prefix backend` (requires no setup).

4. **Seed Demo Data** (Required for the first time):

   ```bash
   npm run seed
   ```

5. **Run the Application**:

   - Start Backend: `npm run dev:backend`
   - Start Frontend: `npm run dev:frontend`

6. **Access the App**:
   - URL: [http://localhost:5174](http://localhost:5174)
   - Demo Login: `admin@smarthr.local` / `Admin123!`

## Current Project Status

- **Database**: Successfully connected to MongoDB Atlas.
- **Backend**: Node.js/Express server running on port 5000.
- **Frontend**: Vite/React application running on port 5174.
- **AI Integration**: OpenAI ready (requires API key in `.env`).
- **Dependencies**: Native `mongodb` driver and `mongoose` are configured.

## MongoDB Atlas

This project uses **MongoDB Atlas** (cloud). You do not need MongoDB Compass or local MongoDB.

Follow **[docs/ATLAS_SETUP.md](docs/ATLAS_SETUP.md)** for step-by-step setup.

## OpenAI Configuration

The app works without `OPENAI_API_KEY` by using deterministic extraction heuristics. To enable AI parsing, set this in `backend/.env`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## Project Structure

```text
backend/
  src/
    config/          MongoDB connection
    controllers/     Route handlers
    middleware/      Auth and upload middleware
    models/          User, Candidate, Job schemas
    routes/          Express routers
    services/        AI parsing, text extraction, matching logic
    uploads/         Local uploaded resumes
  sample-data/       Seed script

frontend/
  src/
    api/             Axios client
    components/      App shell and reusable UI
    context/         Auth provider
    pages/           Dashboard, upload, jobs, analytics, profile
```

## Production Notes

- Store uploads in S3 or equivalent object storage for production.
- Replace local JWT secret with a managed secret.
- Add email delivery through SendGrid, SES, or Postmark for shortlist notifications.
- Run MongoDB with backups, indexes, and monitoring.
- Add queue-based parsing for very large resume batches.
- Add audit logging for Admin actions.
