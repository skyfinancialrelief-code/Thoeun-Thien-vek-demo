# 3-Minute XPRIZE Demonstration Video Script

**Project Name:** VEK Assurance Cloud  
**Company:** GUTS Deterministic Technology LLC  
**Presenter:** Thoeun Thien (Founder)  
**Target Duration:** 2 minutes, 55 seconds  

---

### Timed Outline

#### 0:00 – 0:20 | The Small Business AI Boundary Problem
> "Small businesses are adopting Gemini for report writing, marketing, and accounting. But small business operations cannot risk deploying unvetted AI outputs that violate internal policies, make unsubstantiated claims, or leak sensitive data."

#### 0:20 – 0:40 | Probabilistic Models vs. Deterministic Qualification
> "Gemini remains a probabilistic generative model. VEK Assurance Cloud does not change Gemini's probabilistic nature. Instead, VEK acts as a deterministic boundary—capturing Gemini's output and evaluating that fixed output against disclosed business policy constraints."

#### 0:40 – 1:20 | Live Gemini Scenario Execution
> "In our live interface hosted on Google Cloud Run, we select Scenario A—a small business report request. VEK sends the prompt server-side to Gemini 3.6 Flash via the `@google/genai` SDK and captures the model candidate output."

#### 1:20 – 1:50 | Decision & Reason Codes Evaluation
> "The VEK demonstration validator inspects the captured output. It evaluates structural reference markers ([REF-101]) and section completeness, returning a decision of **PASS** with deterministic reason codes `REF_STRUCT_VALID` and `DEMO_CONSTRAINTS_SATISFIED`."

#### 1:50 – 2:20 | 100-Replay Consistency Engine
> "Next, we click 'Execute 100 Deterministic Replays'. VEK evaluates this exact captured packet locally 100 times. Result: 100/100 qualification hashes match 100.0% identically. Why? Because wall-clock time and runtime metadata are excluded from the RFC 8785 qualification hash."

#### 2:20 – 2:40 | Download Tamper-Evident Evidence Envelope
> "We click 'Download Evidence Envelope'. VEK outputs a structured JSON artifact containing the input fingerprint, output hash, qualification hash, and envelope hash for reproducible auditability."

#### 2:40 – 2:55 | Business & Deployment Evidence Overview
> "Our Cloud Run deployment operates statelessly with rate limiting and fail-closed security. In compliance with XPRIZE guidelines, business revenue fields remain marked 'NOT YET VERIFIED — REAL EVIDENCE REQUIRED' until verified with third-party accounting data."

#### 2:55 – 3:00 | Conclusion & Claim Boundary
> "VEK Assurance Cloud provides small businesses with replayable confidence in AI workflows. Thank you."
