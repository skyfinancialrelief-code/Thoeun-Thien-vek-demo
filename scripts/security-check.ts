import fs from 'node:fs';
import path from 'node:path';

console.log('\n======================================================');
console.log('🔒 VEK Security & Credential Scan (XPRIZE Requirement)');
console.log('======================================================\n');

const ROOT_DIR = process.cwd();

const IGNORED_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.cache',
  'build',
  'coverage',
]);

const IGNORED_FILES = new Set([
  'package-lock.json',
  'yarn.lock',
]);

// Patterns to detect accidental real credentials
const SECRET_PATTERNS = [
  { name: 'Google/Gemini API Key', regex: /AIzaSy[a-zA-Z0-9_\-]{33}/g },
  { name: 'Generic Secret Key (sk-*)', regex: /sk-[a-zA-Z0-9]{32,}/g },
  { name: 'PEM Private Key Material', regex: /-----BEGIN (PRIVATE|RSA|EC) KEY-----/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Hardcoded Gemini Key Value', regex: /GEMINI_API_KEY\s*=\s*["'](?!MY_GEMINI_API_KEY)[^"']+["']/g },
];

let filesScanned = 0;
let violationsFound = 0;

function scanDirectory(dirPath: string) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        scanDirectory(fullPath);
      }
      continue;
    }

    if (IGNORED_FILES.has(entry.name)) {
      continue;
    }

    // Reject committed actual .env files (except .env.example)
    if (entry.name.startsWith('.env') && entry.name !== '.env.example') {
      console.error(`❌ VIOLATION: Environment file detected in tracked workspace: ${relPath}`);
      violationsFound++;
      continue;
    }

    // Only scan text / code files
    if (
      !/\.(ts|tsx|js|jsx|json|md|html|css|env\.example|yml|yaml|dockerfile)$/i.test(
        entry.name
      ) &&
      entry.name !== 'Dockerfile' &&
      entry.name !== '.gitignore' &&
      entry.name !== '.dockerignore'
    ) {
      continue;
    }

    filesScanned++;
    const content = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of SECRET_PATTERNS) {
      // Skip test suite dummy mock strings in tests/run-tests.ts
      if (
        relPath === 'tests/run-tests.ts' &&
        (pattern.name === 'Google/Gemini API Key' ||
          pattern.name === 'Generic Secret Key (sk-*)' ||
          pattern.name === 'Hardcoded Gemini Key Value')
      ) {
        continue;
      }

      const matches = content.match(pattern.regex);
      if (matches) {
        // Double-check if match is a dummy placeholder string
        const realMatches = matches.filter(
          (m) =>
            !m.includes('MY_GEMINI_API_KEY') &&
            !m.includes('AIzaSyFAKE') &&
            !m.includes('AIzaSyTESTINGKEY')
        );

        if (realMatches.length > 0) {
          console.error(
            `❌ VIOLATION: ${pattern.name} found in ${relPath} (${realMatches.length} occurrences)`
          );
          violationsFound++;
        }
      }
    }
  }
}

scanDirectory(ROOT_DIR);

console.log(`\n📁 Files Scanned: ${filesScanned}`);
if (violationsFound === 0) {
  console.log('✅ SECURITY SCAN PASSED: Zero plain-text credentials, secrets, or .env leaks detected.\n');
  process.exit(0);
} else {
  console.error(`❌ SECURITY SCAN FAILED: ${violationsFound} violation(s) detected.\n`);
  process.exit(1);
}
