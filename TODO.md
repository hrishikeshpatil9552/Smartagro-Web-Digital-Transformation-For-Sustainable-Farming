# TODO - Gemini API key not working (disease + agri-gyaan)

- [ ] Identify exact failing backend error for endpoints:
  - [ ] POST /api/gemini/disease-analysis
  - [ ] POST /api/gemini/agri-gyaan
- [ ] Add clearer backend logging and return Gemini upstream error to frontend (instead of hanging/silent failure)
- [ ] Fix frontend timeout / loading state handling so UI stops “not responding”
- [ ] Verify backend env loading for GEMINI_API_KEY (ensure correct .env is used when running dev)
