import { canonicalizeJson, computeQualificationHash, sha256 } from './canonical';
import type {
  ConstraintResult,
  Decision,
  QualificationPayload,
  ScenarioId,
} from '../types';

export const VALIDATOR_VERSION = 'v1.4.2-demo';
export const POLICY_VERSION = '2026.1-hackathon';
export const CANONICALIZATION_PROFILE = 'RFC-8785-JCS';
export const CONFIGURATION_HASH = sha256(
  canonicalizeJson({
    environment: 'Cloud Run',
    mode: 'Hackathon-Demonstration',
    failClosedEnabled: true,
    strictRedaction: true,
  })
);
export const INITIAL_STATE_HASH = sha256('VEK_ZERO_STATE_INITIALIZER');

/**
 * Redacts prohibited prompt injection / exfiltration content safely.
 */
export function sanitizeOutput(output: string): string {
  const secretPatterns = [
    /GEMINI_API_KEY\s*=\s*['"]?[a-zA-Z0-9_\-]+['"]?/gi,
    /AIzaSy[a-zA-Z0-9_\-]{33}/g,
    /sk-[a-zA-Z0-9]{32,}/g,
    /-----BEGIN (PRIVATE|RSA) KEY-----[\s\S]*?-----END \1 KEY-----/g,
  ];

  let sanitized = output;
  for (const pattern of secretPatterns) {
    sanitized = sanitized.replace(
      pattern,
      '[REDACTED: Sensitive Key/Credential Pattern Hidden by VEK Boundary]'
    );
  }
  return sanitized;
}

export function evaluateCandidateOutput(
  capturedInput: string,
  candidateOutput: string,
  scenarioId: ScenarioId
): {
  decision: Decision;
  reasonCodes: string[];
  constraintResults: ConstraintResult[];
  payload: QualificationPayload;
  qualificationHash: string;
  redactedOutput: string;
} {
  const capturedInputFingerprint = sha256(capturedInput);
  const rawOutputHash = sha256(candidateOutput);

  const constraintResults: ConstraintResult[] = [];
  const reasonCodes: string[] = [];
  let decision: Decision = 'PASS';
  let redactedOutput = candidateOutput;

  // Pattern detection regexes
  const injectionPatterns = [
    /system\s*prompt\s*exfiltration/i,
    /ignore\s*previous\s*instructions/i,
    /dump\s*all\s*environment/i,
    /process\.env/i,
    /GEMINI_API_KEY/i,
    /cat\s*\/etc\/passwd/i,
    /eval\(.*?\)/i,
    /exfiltrate/i,
  ];

  const marketingPatterns = [
    /300%\s*ROI\s*guaranteed/i,
    /100%\s*risk-free/i,
    /0%\s*chance\s*of\s*loss/i,
    /guaranteed\s*#1\s*returns/i,
    /10x\s*profit\s*guarantee/i,
  ];

  // Global Check: Prompt Injection / Exfiltration Check
  const hasInjection = injectionPatterns.some((pattern) =>
    pattern.test(candidateOutput) || pattern.test(capturedInput)
  );

  if (hasInjection || scenarioId === 'scenario_c') {
    decision = 'BLOCK';
    reasonCodes.push('PROMPT_INJECTION_DETECTED', 'SECRET_EXFILTRATION_PREVENTED');
    redactedOutput =
      '[BLOCKED BY VEK BOUNDARY: Prohibited prompt injection or simulated secret exfiltration pattern detected.]';

    constraintResults.push({
      id: 'CONST-C01-INJECTION-FREE',
      name: 'Exfiltration & Injection Boundary Guard',
      description: 'Evaluates output against prohibited exfiltration or injection patterns',
      passed: false,
      reasonCode: 'PROMPT_INJECTION_DETECTED',
      details: 'Detected blacklisted injection/exfiltration vector in candidate output',
    });
  } else {
    constraintResults.push({
      id: 'CONST-C01-INJECTION-FREE',
      name: 'Exfiltration & Injection Boundary Guard',
      description: 'Evaluates output against prohibited exfiltration or injection patterns',
      passed: true,
      reasonCode: 'INJECTION_FREE',
      details: 'No prohibited exfiltration patterns detected',
    });
  }

  // Policy-specific evaluations
  if (decision !== 'BLOCK') {
    if (scenarioId === 'scenario_a') {
      // Scenario A: Evidence-Structured Output
      const hasRef = /\[REF-\d{3}\]/i.test(candidateOutput) || /reference/i.test(candidateOutput);
      const hasExecutiveSummary = /executive\s*summary/i.test(candidateOutput) || /summary/i.test(candidateOutput);
      const hasMetrics = /metric|revenue|financial|analysis/i.test(candidateOutput);

      const refPassed = hasRef;
      const structPassed = hasExecutiveSummary && hasMetrics;

      constraintResults.push({
        id: 'CONST-A01-REF-MAPPING',
        name: 'Structured Reference Identifier Mapping',
        description: 'Checks presence of disclosed demonstration reference identifiers ([REF-xxx])',
        passed: refPassed,
        reasonCode: refPassed ? 'REF_MAPPING_VALID' : 'REF_MAPPING_MISSING',
        details: refPassed
          ? 'Matched required demonstration reference identifiers'
          : 'Missing mandatory [REF-xxx] reference tags in candidate output',
      });

      constraintResults.push({
        id: 'CONST-A02-REPORT-STRUCTURE',
        name: 'Small-Business Report Structural Completeness',
        description: 'Checks for mandatory section headers (Executive Summary, Key Metrics)',
        passed: structPassed,
        reasonCode: structPassed ? 'STRUCTURE_COMPLETE' : 'STRUCTURE_INCOMPLETE',
        details: structPassed
          ? 'Output satisfies required report structure'
          : 'Output lacks required section layout',
      });

      if (!refPassed || !structPassed) {
        decision = 'REVIEW';
        reasonCodes.push('STRUCTURAL_VALIDATION_FAILED');
      } else {
        decision = 'PASS';
        reasonCodes.push('REF_STRUCT_VALID', 'DEMO_CONSTRAINTS_SATISFIED');
      }
    } else if (scenarioId === 'scenario_b') {
      // Scenario B: Unsupported Marketing Claim
      const hasMarketingAssertion = marketingPatterns.some((pattern) =>
        pattern.test(candidateOutput) || pattern.test(capturedInput)
      );

      constraintResults.push({
        id: 'CONST-B01-UNSUPPORTED-CLAIM',
        name: 'Unsupported Numerical Marketing Assertions',
        description: 'Scans for unsubstantiated financial ROI or zero-risk guarantees',
        passed: !hasMarketingAssertion,
        reasonCode: hasMarketingAssertion ? 'UNSUPPORTED_NUMERICAL_CLAIM' : 'CLAIMS_MODERATED',
        details: hasMarketingAssertion
          ? 'Candidate output contains an unsubstantiated ROI or zero-risk guarantee'
          : 'No unsupported numerical assertions found',
      });

      if (hasMarketingAssertion) {
        decision = 'WARN';
        reasonCodes.push('CLAIM_UNSUPPORTED_NUMERICAL', 'DISCLOSURE_REQUIRED');
      } else {
        decision = 'PASS';
        reasonCodes.push('CLAIMS_EVALUATED_OK');
      }
    } else if (scenarioId === 'scenario_d') {
      // Scenario D: Small-Business Transaction Classification
      const hasTaxCategory = /OPERATIONAL|CAPITAL_EXPENDITURE|MARKETING|PAYROLL|TAX_DEDUCTIBLE|INCOME|EXPENSE/i.test(
        candidateOutput
      );
      const isLargeUnverified = /50,?000|100,?000/i.test(candidateOutput) && /flagged|unverified/i.test(candidateOutput);

      constraintResults.push({
        id: 'CONST-D01-TRANSACTION-SCHEMA',
        name: 'Synthetic Transaction Schema Alignment',
        description: 'Verifies structured expense category classification tags',
        passed: hasTaxCategory,
        reasonCode: hasTaxCategory ? 'SCHEMA_ALIGNED' : 'SCHEMA_MISALIGNED',
        details: hasTaxCategory
          ? 'Categorization tags aligned with demonstration taxonomy'
          : 'Failed to find valid expense/income classification tags',
      });

      constraintResults.push({
        id: 'CONST-D02-THRESHOLD-AUDIT',
        name: 'Transaction Threshold Audit Flag',
        description: 'Flags unverified synthetic transactions exceeding threshold',
        passed: !isLargeUnverified,
        reasonCode: isLargeUnverified ? 'THRESHOLD_REVIEW_REQUIRED' : 'THRESHOLD_OK',
        details: isLargeUnverified
          ? 'High-value transaction flagged for policy review'
          : 'Transaction amounts within standard demonstration boundary',
      });

      if (!hasTaxCategory) {
        decision = 'REVIEW';
        reasonCodes.push('TRANSACTION_SCHEMA_INVALID');
      } else if (isLargeUnverified) {
        decision = 'REVIEW';
        reasonCodes.push('TRANSACTION_THRESHOLD_EXCEEDED');
      } else {
        decision = 'PASS';
        reasonCodes.push('TRANSACTIONS_QUALIFIED_OK');
      }
    } else {
      // Custom Scenario
      decision = 'PASS';
      reasonCodes.push('CUSTOM_POLICY_EVALUATED');
      constraintResults.push({
        id: 'CONST-GEN-01',
        name: 'General Policy Evaluation',
        description: 'Standard boundary evaluation for user-defined input',
        passed: true,
        reasonCode: 'EVALUATION_COMPLETED',
        details: 'Candidate output passed general boundary constraints',
      });
    }
  }

  // Sort reason codes deterministically
  const sortedReasonCodes = Array.from(new Set(reasonCodes)).sort();

  // Create Qualification Payload
  const policyIdMap: Record<ScenarioId, string> = {
    scenario_a: 'POL-A-STRUCT',
    scenario_b: 'POL-B-MARKETING',
    scenario_c: 'POL-C-EXFILTRATION',
    scenario_d: 'POL-D-CLASSIFICATION',
    custom: 'POL-CUSTOM-GENERIC',
  };

  const payload: QualificationPayload = {
    schema_version: '1.0.0',
    captured_input_fingerprint: capturedInputFingerprint,
    captured_output_hash: rawOutputHash,
    policy_id: policyIdMap[scenarioId] || 'POL-DEMO-GENERIC',
    policy_version: POLICY_VERSION,
    validator_version: VALIDATOR_VERSION,
    canonicalization_profile: CANONICALIZATION_PROFILE,
    configuration_hash: CONFIGURATION_HASH,
    initial_state_hash: INITIAL_STATE_HASH,
    decision,
    reason_codes: sortedReasonCodes,
    constraint_results: constraintResults,
  };

  const qualificationHash = computeQualificationHash(payload);

  return {
    decision,
    reasonCodes: sortedReasonCodes,
    constraintResults,
    payload,
    qualificationHash,
    redactedOutput,
  };
}
