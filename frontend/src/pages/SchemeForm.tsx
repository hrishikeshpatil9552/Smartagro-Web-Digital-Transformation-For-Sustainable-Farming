// GovernmentSchemeFormMerged.tsx
import React, { useState, CSSProperties } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


/* ----------------- COLORS / STYLES ----------------- */
const PRIMARY_ACCENT = '#10b981';
const DARK_ACCENT = '#059669';
const LIGHT_BG = '#f0fff0';
const CARD_BG = '#FFFFFF';

const styles = {
  container: {
    maxWidth: '850px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: LIGHT_BG,
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    fontFamily: 'sans-serif',
  } as CSSProperties,
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '20px',
    padding: 0,
    transition: 'color 0.2s',
  } as CSSProperties,
  formCard: {
    background: CARD_BG,
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  } as CSSProperties,
  formTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '24px',
    textAlign: 'center',
  } as CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,
  formLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  } as CSSProperties,
  inputField: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    background: CARD_BG,
    width: '100%',
  } as CSSProperties,
  submitBtn: {
    background: `linear-gradient(135deg, ${PRIMARY_ACCENT}, ${DARK_ACCENT})`,
    color: 'white',
    border: 'none',
    padding: '16px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '12px',
    gridColumn: '1 / -1',
  } as CSSProperties,
  resultsContainer: {
    marginTop: '40px',
  } as CSSProperties,
  resultCard: {
    padding: '18px',
    marginBottom: '16px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    background: CARD_BG,
    borderLeft: `6px solid ${PRIMARY_ACCENT}`,
  } as CSSProperties,
  resultTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  } as CSSProperties,
  scoreBadge: {
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 700,
    color: 'white',
  } as CSSProperties,
  viewBtn: {
    marginTop: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    color: 'white',
    background: DARK_ACCENT,
  } as CSSProperties,
  smallMeta: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '8px',
  } as CSSProperties,
};

/* ---------------- TYPES ---------------- */
interface MatchResult {
  schemeId: string;
  matchId?: string;
  title: string;
  description: string;
  score: number;
  last_date: string | null;
  generated: boolean;
  confidence: number;
}

interface SchemeFormProps {
  onBack: () => void;
}

/* ---------------- COMPONENT ---------------- */
export default function GovernmentSchemeFormMerged({ onBack }: SchemeFormProps) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    state: "Maharashtra",
    district: "",
    taluka: "",
    village: "",
    land_size: "",
    caste: "GEN",
    income: "",
    category: "crops",
    crops: "",
    farming_category: "crop_farming",
  });

  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // ⭐ ADD THIS: FarmerId state
  const [farmerId, setFarmerId] = useState<string | null>(null);

  const handleChange = (k: string, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        farmer: {
          ...form,
          land_size: form.land_size ? Number(form.land_size) : undefined,
          income: form.income ? Number(form.income) : undefined,
          crops: form.crops ? form.crops.split(",").map((s) => s.trim()) : [],
        }
      };

      const r = await axios.post("http://localhost:5000/api/gemini/match", payload);

      setResults(r.data.matched || []);

      // ⭐ ADD THIS LINE (IMPORTANT)
      setFarmerId(r.data.farmerId || null);

    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeStyle = (score: number): CSSProperties => {
    if (score >= 80) return { ...styles.scoreBadge, background: PRIMARY_ACCENT };
    if (score >= 50) return { ...styles.scoreBadge, background: '#f59e0b' };
    return { ...styles.scoreBadge, background: '#ef4444' };
  };

  return (
    <div style={styles.container}>
      <button
        onClick={onBack}
        style={styles.backBtn}
        onMouseEnter={(e) => (e.currentTarget.style.color = PRIMARY_ACCENT)}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
      >
        ← Back to Dashboard
      </button>

      <h2 style={styles.formTitle}>Welcome to Agro Web 🌱</h2>


      <div style={styles.formCard}>
        <form onSubmit={submit} style={{ display: 'contents' }}>
          
          {/* FORM FIELDS REMAIN SAME */}
          {/* Full Name */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Full Name *</label>
            <input style={styles.inputField} type="text" value={form.name}
              onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          {/* Phone */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Phone *</label>
            <input style={styles.inputField} type="tel" value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)} required />
          </div>

          {/* State */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>State *</label>
            <input style={styles.inputField} type="text" value={form.state}
              onChange={(e) => handleChange("state", e.target.value)} required />
          </div>

          {/* District */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>District *</label>
            <input style={styles.inputField} type="text" value={form.district}
              onChange={(e) => handleChange("district", e.target.value)} required />
          </div>

          {/* Village */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Village</label>
            <input style={styles.inputField} type="text" value={form.village}
              onChange={(e) => handleChange("village", e.target.value)} />
          </div>

          {/* Land Size */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Land Size (ha)</label>
            <input style={styles.inputField} type="number" value={form.land_size}
              onChange={(e) => handleChange("land_size", e.target.value)} />
          </div>

          {/* Caste */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Caste *</label>
            <select style={styles.inputField} value={form.caste}
              onChange={(e) => handleChange("caste", e.target.value)}>
              <option value="GEN">General</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="OBC">OBC</option>
            </select>
          </div>

          {/* Income */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Annual Income *</label>
            <input style={styles.inputField} type="number" value={form.income}
              onChange={(e) => handleChange("income", e.target.value)} />
          </div>

          {/* Crops */}
          <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
            <label style={styles.formLabel}>Crops (comma separated)</label>
            <input style={styles.inputField} type="text" value={form.crops}
              onChange={(e) => handleChange("crops", e.target.value)} />
          </div>

          {/* Farming Category */}
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Farming Category *</label>
            <select
              style={styles.inputField}
              value={form.farming_category}
              onChange={(e) => handleChange("farming_category", e.target.value)}
            >
              <option value="crop_farming">Crop Farming (General)</option>
              <option value="horticulture">Horticulture</option>
              <option value="animal_husbandry">Animal Husbandry / Dairy</option>
              <option value="farm_mechanization">Farm Mechanization</option>
              <option value="agri_business">Agri-Business</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" style={styles.submitBtn}>
            {loading ? "Searching..." : "✨ Find Best Schemes"}
          </button>
        </form>
      </div>

      {/* RESULTS */}
      <div style={styles.resultsContainer}>
        <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#065f46', marginBottom: '12px' }}>
          🎯 Scheme Matches
        </h3>

        {results.length === 0 && !loading && (
          <p style={{ color: '#6b7280' }}>No matches yet. Fill the form and click "Find Best Schemes".</p>
        )}

        {results.map((r) => (
          <div key={r.schemeId} style={styles.resultCard}>
            <div style={styles.resultTitleRow}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{r.title}</h4>
              <span style={getScoreBadgeStyle(r.score)}>{r.score}% Match</span>
            </div>

            <p style={{ margin: '6px 0 0 0', color: '#374151' }}>{r.description}</p>

            {/* <div style={styles.smallMeta}>
              <p><strong>Last Date:</strong> {r.last_date || "N/A"}</p>
              <p>
                <strong>Source:</strong> {r.generated ? "Gemini AI" : "Database"}
                <span style={{ marginLeft: 12 }}><strong>Confidence:</strong> {r.confidence}</span>
              </p>
            </div> */}

            <button
              style={styles.viewBtn}
              onClick={() => navigate(`/explain/${r.matchId ?? r.schemeId}`)}
            >
              View Full Details ➡️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
