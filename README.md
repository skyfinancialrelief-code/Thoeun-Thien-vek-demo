# VEK Assurance Cloud

**Company:** GUTS Deterministic Technology LLC  
**Founder:** Thoeun Thien  
**Competition:** Build with Gemini XPRIZE  
**Selected Category:** Small Business Services  

---

## Mandatory Scientific Claim Boundary Statement

> “VEK Assurance Cloud does not make Gemini or any other probabilistic model deterministic and does not independently prove factual truth. It deterministically evaluates a captured model output against a disclosed demonstration policy. Given the same captured input, captured output, policy version, validator version, canonicalization profile, configuration, and initial state, the qualification process is designed to return the same decision and qualification hash.”

---

## Core Business Purpose & Value Proposition

Small businesses increasingly rely on AI models like Gemini for operational tasks, marketing copy, compliance reports, and accounting categorizations. However, small businesses require a **deterministic post-generation qualification boundary** to ensure model outputs adhere to company policies, structural constraints, and safety guidelines before deployment or publication.

**VEK Assurance Cloud** captures fixed Gemini candidate outputs, evaluates them against disclosed demonstration policies, returns **PASS, WARN, BLOCK, or REVIEW**, and produces a reproducible, tamper-evident evidence envelope.

---

## Key Features & Demonstrated Workflows

1. **Server-Side Gemini Integration**: Makes real Gemini API calls via `@google/genai` using configurable `GEMINI_MODEL` (default: `gemini-3.6-flash`).
2. **Deterministic RFC 8785 JSON Canonicalization**: Uses JCS sorting and canonical formatting for strict hash reproducibility.
3. **Dual Hash Commitment**:
   - **Qualification Hash**: Covers ONLY deterministic payload material (schema, fingerprints, policy, decision, reason codes, constraint results). Wall-clock time and execution IDs are explicitly EXCLUDED!
   - **Evidence Envelope Hash**: Covers the complete evidence envelope including timestamps and deployment IDs.
4. **100-Replay Engine**: Evaluates a single captured output packet 100 times in-memory, verifying 100.0% qualification hash consistency without making extra Gemini API calls.
5. **Four Disclosed Demonstration Policies**:
   - **Scenario A (POL-A-STRUCT)**: Evidence-Structured Output (PASS)
   - **Scenario B (POL-B-MARKETING)**: Unsupported Marketing Claim (WARN)
   - **Scenario C (POL-C-EXFILTRATION)**: Prompt Injection / Secret Exfiltration Attempt (BLOCK & Redaction)
   - **Scenario D (POL-D-CLASSIFICATION)**: Small-Business Transaction Classification (REVIEW/PASS)
6. **Containerized Cloud Run Deployment**: Production-ready Dockerfile, health endpoint (`/api/health`), rate limiting, secure headers, and fail-closed handling.

---

## Approved & Prohibited Terminology

### Approved Terms
- deterministic qualification
- replay consistency
- constraint evaluation
- fail-closed handling
- tamper-evident evidence
- hash-bound commitment
- captured model output
- disclosed demonstration policy
- tested configuration

### Prohibited & Overstated Phrases (Replaced / Excluded)
- "proves stability" -> "demonstrates replay consistency under the tested configuration"
- "tamper-proof" -> "tamper-evident under disclosed assumptions"
- "sealed proof" -> "hash-bound evidence envelope"
- "verified citation" -> "structurally matched reference identifier"
- "guaranteed safe" -> "satisfied the modeled demonstration constraints"

---

## Local Development & Testing

```bash
# 1. Install Dependencies
npm install

# 2. Run Test Suite
npm test

# 3. Run Security Scan
npm run security:check

# 4. Start Development Server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

---

## Deployment to Google Cloud Run

```bash
# Build production bundle
npm run build

# Start production server locally
npm start
```

Refer to `CLOUD_RUN_DEPLOYMENT.md` for full deployment instructions.
