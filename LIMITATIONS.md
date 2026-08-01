# Operational & Demonstration Limitations

**Project:** VEK Assurance Cloud  
**Company:** Guts Deterministic Technology LLC  

---

## Technical & Scope Limitations

1. **Demonstration Policy Corpus**: This demonstration includes 4 disclosed policy scenarios (`POL-A` through `POL-D`). It does not contain proprietary production policy corpora.
2. **Local In-Memory Telemetry**: Telemetry metrics are stored statelessly in memory during container execution. Production deployment requires external persistent database integration.
3. **Model Dependence**: Model generation quality depends on Gemini API behavior. VEK evaluates the captured candidate output post-generation.
4. **Factual Verification Boundary**: VEK verifies structural, syntactical, and policy constraint adherence. It does not perform independent ground-truth fact checking against external databases unless explicit external lookup tools are configured.
5. **Replay Engine Boundary**: The 100-replay engine evaluates fixed captured packets in-memory. Re-querying Gemini live with temperature > 0 will yield varying model candidate outputs; VEK's replay consistency guarantees apply specifically to evaluating the *same captured input-output packet*.
6. **Redacted BLOCK Replay Limitation**: When a candidate output is blocked and redacted (e.g., Scenario C prompt injection), the redacted public preview artifact strips raw secret payloads for security. Replaying the redacted public preview will evaluate the redacted string rather than the raw candidate output, resulting in a qualification hash distinct from the original raw-output qualification hash.
