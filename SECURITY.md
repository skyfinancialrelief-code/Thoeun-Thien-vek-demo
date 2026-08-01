# Security Architecture & Credential Protection

**Project:** VEK Assurance Cloud  
**Company:** Guts Deterministic Technology LLC  

---

## Security Directives & Controls

1. **Server-Side API Key Isolation**:
   - `GEMINI_API_KEY` is accessed strictly in server-side Node.js code (`server.ts`).
   - The key is NEVER exposed to Vite, client-side bundles, browser requests, logs, or error responses.

2. **Automated Credential Scanning**:
   - The repository includes `scripts/security-check.ts` (`npm run security:check`).
   - Scans project files for plain-text API keys, PEM private keys, AWS tokens, or hardcoded credentials before deployment.

3. **Input Sanitization & Secret Redaction**:
   - Output sanitizer (`sanitizeOutput`) in `src/lib/validator.ts` redacts key patterns (`AIzaSy...`, `sk-...`, `GEMINI_API_KEY=...`).
   - Scenario C (BLOCK decision) applies safe redaction previews before rendering in UI.

4. **Network & Request Protection**:
   - Rate limiting: Maximum 120 requests/minute per client IP.
   - Body size restriction: Express JSON parser capped at `1mb`.
   - Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`.

5. **Fail-Closed Strategy**:
   - In the event of Gemini API timeout (10s) or error, VEK fails closed to ensure unverified model outputs cannot bypass safety checks.
