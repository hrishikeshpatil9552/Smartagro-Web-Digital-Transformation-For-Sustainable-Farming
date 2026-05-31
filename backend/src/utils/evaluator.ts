// src/utils/evaluator.ts
import { IFarmer } from '../models/Farmer';
import { IEligibility } from '../models/Scheme';

// --- Helpers for readability ---
function formatFieldName(field: string): string {
  if (!field) return "Criteria";
  // Convert "farm_size" -> "Farm Size"
  return field.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatOp(op: string): string {
  const map: Record<string, string> = {
    '>': 'greater than', '>=': 'at least', '<': 'less than',
    '<=': 'at most', '==': 'exactly', '!=': 'not',
    'in': 'one of', 'contains': 'containing'
  };
  return map[op] || String(op);
}

// --- Normalization Helper ---
export function normalizeValue(v: any) {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string') return v.trim();
  return v;
}

// --- Rule Evaluation Logic ---
export function evalRule(farmer: Partial<IFarmer>, rule: any): boolean {
  if (!rule || !rule.field) return true; // Default to safe

  // 1. Resolve nested fields (e.g., "address.state")
  const val = (() => {
    const parts = String(rule.field).split('.');
    let cur: any = farmer;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  })();

  const a = normalizeValue(val);
  const b = rule.value;

  // 2. Compare based on operator
  if (rule.op === '==') return String(a).toLowerCase() == String(b).toLowerCase();
  if (rule.op === '!=') return String(a).toLowerCase() != String(b).toLowerCase();
  
  // Numeric checks
  const numA = Number(a);
  const numB = Number(b);
  if (!isNaN(numA) && !isNaN(numB)) {
    if (rule.op === '>') return numA > numB;
    if (rule.op === '<') return numA < numB;
    if (rule.op === '>=') return numA >= numB;
    if (rule.op === '<=') return numA <= numB;
  }

  // Array checks
  if (rule.op === 'in' && Array.isArray(b)) {
      // If farmer value is also array (e.g. crops grown), check intersection
      if (Array.isArray(a)) return a.some(x => b.includes(x));
      return b.includes(a);
  }
  if (rule.op === 'contains') {
      if (Array.isArray(a)) return a.includes(b);
      return String(a).toLowerCase().includes(String(b).toLowerCase());
  }

  return true; // Default to true if operator unknown
}

// --- Main Evaluator Function ---
export function evaluateEligibility(farmer: Partial<IFarmer>, eligibilityJson?: IEligibility) {
  // 1. Safety Checks
  if (!eligibilityJson || !Array.isArray(eligibilityJson.rules)) {
    return { score: 100, passed: true, reasons: [] }; // Assume eligible if no rules
  }

  const rules = eligibilityJson.rules;
  const logic = eligibilityJson.logic || 'AND';

  if (rules.length === 0) return { score: 100, passed: true, reasons: [] };

  const reasons: string[] = [];
  let passedCount = 0;
  let validRulesCount = 0;

  for (const r of rules) {
    // === FIX 1: Handle String Rules (Gemini hallucinations) ===
    if (typeof r === 'string') {
        // Just add the text explanation directly. Do NOT try to parse it.
        // Assume these are "informational" rules that don't auto-fail the user.
        reasons.push(r); 
        continue; 
    }

    // === FIX 2: Handle Malformed Objects ===
    // If it's missing 'field' or 'op', skip it entirely.
    if (!r || typeof r !== 'object' || !r.field || !r.op) {
        continue;
    }

    // Valid rule found
    validRulesCount++;
    const ok = evalRule(farmer, r);

    if (ok) {
      passedCount++;
    } else {
      // === FIX 3: Safe Formatting ===
      const f = formatFieldName(r.field);
      const o = formatOp(r.op);
      const v = (r.value === undefined || r.value === null) ? '' : r.value;
      
      reasons.push(`${f} should be ${o} ${v}`);
    }
  }

  // Calculate Final Score
  // If we filtered out all rules, assume 100% eligible
  if (validRulesCount === 0) {
      return { score: 100, passed: true, reasons: passedCount === 0 ? [] : reasons };
  }

  const passed = logic === 'OR' ? passedCount > 0 : passedCount === validRulesCount;
  const score = passed ? 100 : Math.round((passedCount / validRulesCount) * 100);

  return { score, passed, reasons: passed ? [] : reasons };
}