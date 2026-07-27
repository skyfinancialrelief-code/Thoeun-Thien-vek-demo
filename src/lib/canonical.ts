import { createHash } from 'node:crypto';
import type { EvidenceEnvelope, QualificationPayload } from '../types';

/**
 * RFC 8785 JSON Canonicalization Scheme (JCS)
 * Canonicalizes JSON data structures deterministically:
 * 1. Object keys sorted lexicographically by UTF-16 code unit values.
 * 2. No whitespace between structural separators.
 * 3. Numbers formatted canonically.
 * 4. Strings escaped properly.
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return JSON.stringify(obj);
    }
    if (typeof obj === 'number') {
      if (!Number.isFinite(obj)) {
        throw new TypeError('Canonicalization error: Non-finite numbers are not supported');
      }
      return Object.is(obj, -0) ? '0' : JSON.stringify(obj);
    }
    if (typeof obj === 'boolean') {
      return obj ? 'true' : 'false';
    }
    if (typeof obj === 'undefined') {
      return 'null';
    }
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const elements = obj.map((item) => canonicalizeJson(item));
    return `[${elements.join(',')}]`;
  }

  // Object key sorting according to RFC 8785 (UTF-16 code unit sorting)
  const sortedKeys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort((a, b) => {
      if (a === b) return 0;
      return a < b ? -1 : 1;
    });

  const entries = sortedKeys.map((key) => {
    const keyStr = JSON.stringify(key);
    const valStr = canonicalizeJson(obj[key]);
    return `${keyStr}:${valStr}`;
  });

  return `{${entries.join(',')}}`;
}

/**
 * SHA-256 Digest Helper
 */
export function sha256(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Computes the Qualification Hash.
 * MUST cover ONLY deterministic qualification material:
 * - schema_version
 * - captured_input_fingerprint
 * - captured_output_hash
 * - policy_id
 * - policy_version
 * - validator_version
 * - canonicalization_profile
 * - configuration_hash
 * - initial_state_hash
 * - decision
 * - reason_codes (sorted deterministically)
 * - constraint_results (sorted by constraint ID)
 *
 * NOTE: Timestamps, execution IDs, request duration, and random UUIDs are EXCLUDED!
 */
export function computeQualificationHash(payload: QualificationPayload): string {
  // Normalize and sort reason_codes deterministically
  const sortedReasonCodes = [...payload.reason_codes].sort();

  // Normalize and sort constraint_results by id
  const sortedConstraintResults = [...payload.constraint_results]
    .map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      passed: c.passed,
      reasonCode: c.reasonCode,
      details: c.details,
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const deterministicPayload = {
    canonicalization_profile: payload.canonicalization_profile,
    captured_input_fingerprint: payload.captured_input_fingerprint,
    captured_output_hash: payload.captured_output_hash,
    configuration_hash: payload.configuration_hash,
    constraint_results: sortedConstraintResults,
    decision: payload.decision,
    initial_state_hash: payload.initial_state_hash,
    policy_id: payload.policy_id,
    policy_version: payload.policy_version,
    reason_codes: sortedReasonCodes,
    schema_version: payload.schema_version,
    validator_version: payload.validator_version,
  };

  const canonicalString = canonicalizeJson(deterministicPayload);
  return sha256(canonicalString);
}

/**
 * Computes the Evidence Envelope Hash.
 * Covers the complete evidence envelope EXCLUDING envelope_hash itself.
 */
export function computeEnvelopeHash(
  envelope: Omit<EvidenceEnvelope, 'envelope_hash'>
): string {
  const envelopePayload = {
    captured_input: envelope.captured_input,
    captured_output: envelope.captured_output,
    captured_timestamp: envelope.captured_timestamp,
    cloud_deployment_id: envelope.cloud_deployment_id,
    evidence_envelope_version: envelope.evidence_envelope_version,
    execution_id: envelope.execution_id,
    model_id: envelope.model_id,
    previous_envelope_hash: envelope.previous_envelope_hash,
    qualification_hash: envelope.qualification_hash,
    qualification_payload: envelope.qualification_payload,
    replay_result: envelope.replay_result,
    request_duration_ms: envelope.request_duration_ms,
  };

  const canonicalString = canonicalizeJson(envelopePayload);
  return sha256(canonicalString);
}
