# Release Manifest

**Project Name:** VEK Assurance Cloud  
**Release Version:** 1.0.0-hackathon  
**Company:** GUTS Deterministic Technology LLC  
**Date:** July 2026  

---

## Artifact Inventory

- `server.ts` -> Express full-stack custom server entry point
- `dist/server.cjs` -> Production CommonJS bundled server
- `dist/index.html` -> Production compiled React SPA
- `src/lib/canonical.ts` -> RFC 8785 JCS canonical serializer
- `src/lib/validator.ts` -> VEK Demonstration Validator
- `src/lib/replay.ts` -> 100-Replay Engine
- `tests/run-tests.ts` -> 24 Automated XPRIZE compliance test cases
- `scripts/security-check.ts` -> Credential security scanner
- `Dockerfile` -> Multi-stage Cloud Run container build
