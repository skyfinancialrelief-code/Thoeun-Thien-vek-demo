# Google Cloud Run Deployment Guide

**Project Name:** VEK Assurance Cloud  
**Company:** Guts Deterministic Technology LLC  

---

## Deployment Prerequisites

- Google Cloud Platform (GCP) Project
- Google Cloud SDK (`gcloud` CLI installed)
- Docker installed locally (or Cloud Build enabled)

---

## Environment Variables

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes | - | Server-side API key for Google Gemini API |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Configurable Gemini model identifier |
| `PORT` | No | `3000` | Port listened on by Express server |
| `NODE_ENV` | No | `production` | Node environment flag |

---

## Deployment Commands

```bash
# 1. Set Google Cloud Project ID
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build and Deploy directly to Cloud Run
gcloud run deploy vek-assurance-cloud \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL="gemini-3.6-flash" \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest

# 3. Verify Health Check
curl https://YOUR_CLOUD_RUN_URL/api/health
```
