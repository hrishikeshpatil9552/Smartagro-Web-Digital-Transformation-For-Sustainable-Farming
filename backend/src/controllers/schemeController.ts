// src/controllers/schemeController.ts
import { Request, Response } from 'express';
import Scheme from '../models/Scheme';
import Farmer from '../models/Farmer';
import Match from '../models/Match';
import { evaluateEligibility } from '../utils/evaluator';

// --- HELPER FUNCTIONS FOR FORMATTING ---

const formatFieldName = (field: string) => {
  if (!field) return "Criteria";
  return field.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const formatOp = (op: string) => {
  const map: Record<string, string> = {
    '>': 'greater than', '>=': 'at least', '<': 'less than',
    '<=': 'at most', '==': 'exactly', '!=': 'not',
    'in': 'one of', 'contains': 'containing'
  };
  return map[op] || op;
};

// --- ROBUST RULE FORMATTER ---
const formatRules = (json: any): string[] => {
  if (!json || !json.rules || !Array.isArray(json.rules)) {
      return ["Check official guidelines for detailed eligibility."];
  }
  
  // Map and Filter to remove "undefined" errors
  const formatted = json.rules.map((r: any) => {
    // 1. If it's just a string, return it directly
    if (typeof r === 'string') return r;

    // 2. If it's a bad object, return null (to filter later)
    if (!r || typeof r !== 'object' || !r.field || !r.op) {
        return null; 
    }

    // 3. Format valid rule
    const f = formatFieldName(r.field);
    const o = formatOp(r.op);
    const v = (r.value === undefined || r.value === null) ? '' : r.value;

    return `${f} should be ${o} ${v}`;
  });

  // Remove nulls (bad rules)
  return formatted.filter((item: any) => item !== null);
};

// --- CONTROLLERS ---

/**
 * GET /api/schemes
 * List all schemes stored in DB.
 */
export const listSchemes = async (req: Request, res: Response) => {
  try {
    const schemes = await Scheme.find().lean();
    res.json({ schemes });
  } catch (err) {
    console.error('listSchemes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/schemes/:id
 * Fetch a scheme by database ID.
 */
export const getSchemeById = async (req: Request, res: Response) => {
  try {
    const scheme = await Scheme.findById(req.params.id).lean();
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.json({ scheme });
  } catch (err) {
    console.error('getSchemeById error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/schemes/match
 * Matches farmer data with ALL schemes in DB.
 */
export const matchSchemes = async (req: Request, res: Response) => {
  try {
    const farmerBody = req.body;
    if (!farmerBody || typeof farmerBody !== 'object') {
      return res.status(400).json({ error: 'Invalid farmer data' });
    }

    // Save farmer record
    const farmer = new Farmer(farmerBody);
    await farmer.save();

    // Fetch schemes (filter by state for initial pruning)
    const filter =
      farmerBody.state
        ? { $or: [{ states: [] }, { states: farmerBody.state }] }
        : {};

    const schemes = await Scheme.find(filter).lean();

    const matchedResults: any[] = [];

    for (const s of schemes) {
      // Use the safe evaluator we fixed earlier
      const result = evaluateEligibility(farmerBody, s.eligibility_json);

      // If score >= 50, consider it as a potential match
      if (result.score >= 50) {
        const matchDoc = new Match({
          farmer: farmer._id,
          scheme: s._id,
          match_score: result.score,
          eligibility_explanation:
            result.reasons.length > 0
              ? result.reasons.join('; ')
              : 'Eligible'
        });

        await matchDoc.save();

        matchedResults.push({
          matchId: matchDoc._id,
          schemeId: s._id,
          title: s.title,
          description: s.description,
          score: result.score,
          reasons: result.reasons, // These are safe now because evaluator is fixed
          documents: s.documents_required,
          last_date: s.eligibility_json?.last_date || null,
          generated: s.generated_by === 'gemini',
          verified: s.verified || false
        });
      }
    }

    return res.json({
      matched: matchedResults,
      farmerId: farmer._id
    });
  } catch (err) {
    console.error('matchSchemes error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/schemes/explain
 * Returns structured explanation object for the Frontend ExplanationPage.
 */
export const getSchemeExplanation = async (req: Request, res: Response) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ error: "Match ID is required" });
    }

    // 1. Find the Match and populate the Scheme details
    const match = await Match.findById(matchId).populate('scheme');
    
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const scheme = match.scheme as any;
    if (!scheme) {
      return res.status(404).json({ error: "Associated scheme details not found" });
    }

    // 2. Construct the Explanation Object
    const explanation = {
      // Use description or title for the overview text
      english: scheme.description || scheme.title, 
      
      // FIX: Use the robust formatRules helper here
      eligibility_rules: formatRules(scheme.eligibility_json),
      
      // Pass the documents array
      documents_required: scheme.documents_required || [],
      
      // Where to apply link/text
      where_to_apply: {
        url: scheme.source_url || null,
        text: scheme.source_url ? "Click here to apply online" : "Visit your local agriculture office"
      },
      
      // Last date
      last_date: scheme.eligibility_json?.last_date || null,
      
      // Raw text explanation from the match record
      raw_text: match.eligibility_explanation || 'Eligible'
    };

    // 3. Send response
    res.json({ explanation });

  } catch (error) {
    console.error("Error fetching scheme explanation:", error);
    res.status(500).json({ error: "Server error fetching explanation" });
  }
};