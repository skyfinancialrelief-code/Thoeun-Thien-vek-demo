# Operational & Demonstration Limitations

**Project:** VEK Assurance Cloud  
**Company:** GUTS Deterministic Technology LLC  

---

## Technical & Scope Limitations

1. **Demonstration Policy Corpus**: This demonstration includes 4 disclosed policy scenarios (`POL-A` through `POL-D`). It does not contain proprietary production policy corpora.
2. **Local In-Memory Telemetry**: Telemetry metrics are stored statelessly in memory during container execution. Production deployment requires external persistent database integration.
3. **Model Dependence**: Model generation quality depends on Gemini API behavior. VEK evaluates the captured candidate output post-generation.
4. **Factual Verification Boundary**: VEK verifies structural, syntactical, and policy constraint adherence. It does not perform independent ground-truth fact checking against external databases unless explicit external lookup tools are configured.
5. **Replay Engine Boundary**: The 100-replay engine evaluates fixed captured packets. Re-querying Gemini live with temperature > 0 will yield varying model candidate outputs; VEK's replay consistency guarantees apply to evaluating the *same captured input-output packet*.
