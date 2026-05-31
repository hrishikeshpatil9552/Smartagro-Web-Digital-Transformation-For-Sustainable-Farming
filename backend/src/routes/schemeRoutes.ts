// src/routes/schemeRoutes.ts
// Express router for scheme endpoints
import express from 'express';
import { listSchemes, getSchemeById, matchSchemes, getSchemeExplanation } from "../controllers/schemeController";

const router = express.Router();

/**
 * GET /api/schemes
 * - List all local schemes (from DB)
 */
router.get('/', listSchemes);

/**
 * GET /api/schemes/:id
 * - Get scheme by DB _id
 */
router.get('/:id', getSchemeById);

/**
 * POST /api/schemes/match
 * - Accepts farmer profile (state,district,land_size,caste,income,category,crops...)
 * - Saves farmer and returns matched schemes (creates Match records)
 *
 * Body example:
 * {
 *   "name":"Ram",
 *   "phone":"9999999999",
 *   "state":"Maharashtra",
 *   "district":"Kolhapur",
 *   "land_size":1.5,
 *   "caste":"OBC",
 *   "income":90000,
 *   "category":"crops",
 *   "crops":["onion","tomato"]
 * }
 */
router.post('/match', matchSchemes);

/**
 * POST /api/schemes/explain
 * - Body: { matchId: "<matchId>" }
 * - Returns deterministic, human-readable explanation saved in Match
 */
router.post('/explain', getSchemeExplanation);

export default router;
