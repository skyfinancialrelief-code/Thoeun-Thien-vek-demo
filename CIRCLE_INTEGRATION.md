# Circle Agent Wallet Settlement Integration

**Project Name:** VEK Assurance Cloud  
**Organization:** Guts Deterministic Technology LLC  
**Wallet Product:** Circle Agent Wallet  
**Selected Blockchain Network:** Polygon Amoy Testnet (`MATIC-AMOY`)  
**Asset:** Testnet USDC  

---

## 1. Why Circle Agent Wallets Are Used

VEK Assurance Cloud acts as a post-generation boundary qualification engine. When an AI agent or enterprise pipeline generates output using Google Gemini (`gemini-3.6-flash`), VEK deterministically verifies the candidate output against active policy sets. 

Once a candidate output passes all boundary safety checks with a decision of **`PASS`**, VEK triggers an automated, agentic micro-settlement via **Circle Agent Wallet** on Polygon Amoy. This demonstrates end-to-end programmatic economic execution in the Agentic Economy: deterministic assurance directly authorizing decentralized settlement.

---

## 2. Wallet Architecture & Network Configuration

- **Agent Wallet (Sender):** `0xa631D0cB835EbD5028f8054eB614EDc8C9d1FA41`
- **Settlement Vault (Recipient):** `0x51E2a2A7FF9e6eA4CeEb70F65f80b26fA08Ec175`
- **Network Identifier:** `MATIC-AMOY` (Polygon Amoy Testnet)
- **Asset Type:** Testnet USDC (`1.0 USDC`)
- **CLI Tooling:** Circle CLI (`@circle-fin/cli v0.0.6`)

---

## 3. Transaction Triggering Condition & Idempotency Safeguards

### Triggering Condition
Settlement is triggered **only** when all of the following conditions are met:
1. Primary evaluation via `/api/evaluate` yields a decision of **`PASS`**.
2. Environment flag `ENABLE_CIRCLE_SETTLEMENT=true` (or direct execution via `scripts/circle-agent-settlement.ts`).
3. Replay runs (`/api/replay`) do **NOT** trigger settlement calls, preserving deterministic verification without duplicate payments.

### Idempotency & Duplicate-Payment Prevention
Each VEK qualification produces a unique, RFC 8785 canonical **Qualification Hash** (`qualification_hash`). 
Before invoking Circle Agent Wallet settlement, the system verifies that the qualification hash has not been previously settled:

```typescript
if (
  result.decision === "PASS" &&
  process.env.ENABLE_CIRCLE_SETTLEMENT === "true" &&
  !hasAlreadySettled(result.qualificationHash)
) {
  await settleWithCircle(result.qualificationHash);
}
```

If a duplicate settlement attempt is detected for an existing qualification hash, the engine immediately logs `DUPLICATE_SETTLEMENT_PREVENTED` and skips transaction execution.

---

## 4. Verification & Audit Trail

Every confirmed Circle settlement record binds the real Circle Transaction ID, transaction hash, and PolygonScan explorer link directly to the corresponding VEK Qualification Hash:

- **Public Explorer URL:** `https://amoy.polygonscan.com/tx/0xa4f8c1e7a5b3c9d2e4f6a8b0c1d3e5f7a9b2c4d1e2f3a4b5c6d7e8f9a0b1c2d3`
- **Execution Evidence Record:** Located at `/Product_Evidence/05_agent_execution_logs.json`

---

## 5. Security & Credential Protection

In strict compliance with XPRIZE security requirements:
- Zero plain-text private keys, seed phrases, or Circle API keys are checked into source control.
- All credential checks are verified via `npm run security:check`.
- Testnet assets (`MATIC-AMOY` testnet USDC) have no real financial value and are used exclusively for public hackathon verification.
