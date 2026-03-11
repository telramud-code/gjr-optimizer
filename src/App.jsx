import { useState, useEffect, useCallback, useRef } from "react";
import {
  ScatterChart, Scatter, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, Legend, PieChart, Pie
} from "recharts";

// ─── ETF UNIVERSE ─────────────────────────────────────────────────────────────
const ETF_META = {
  SPY:  { name:"SPDR S&P 500",           sector:"Renta Variable EEUU",   color:"#38bdf8" },
  QQQ:  { name:"Invesco Nasdaq-100",      sector:"Tecnología EEUU",       color:"#818cf8" },
  IWM:  { name:"iShares Russell 2000",    sector:"Small Cap EEUU",        color:"#a78bfa" },
  EEM:  { name:"iShares EM",              sector:"Emergentes",            color:"#fb923c" },
  EFA:  { name:"iShares MSCI EAFE",       sector:"Internacional Dev.",    color:"#34d399" },
  GLD:  { name:"SPDR Gold Trust",         sector:"Commodities",           color:"#fbbf24" },
  XLE:  { name:"Energy Select SPDR",      sector:"Energía",               color:"#f87171" },
  XLF:  { name:"Financial Select SPDR",   sector:"Financiero",            color:"#60a5fa" },
  IVW:  { name:"iShares S&P 500 Growth",  sector:"Growth EEUU",           color:"#c084fc" },
  IVE:  { name:"iShares S&P 500 Value",   sector:"Value EEUU",            color:"#4ade80" },
  EWZ:  { name:"iShares Brazil",          sector:"Brasil",                color:"#22d3ee" },
  SLV:  { name:"iShares Silver Trust",    sector:"Commodities",           color:"#e2e8f0" },
  IBB:  { name:"iShares Biotech",         sector:"Biotecnología",         color:"#f472b6" },
  ITA:  { name:"iShares Aerospace & Def", sector:"Defensa",               color:"#fb7185" },
  EWJ:  { name:"iShares Japan",           sector:"Japón",                 color:"#2dd4bf" },
  IJH:  { name:"iShares S&P 400 Mid",     sector:"Mid Cap EEUU",          color:"#7dd3fc" },
  URA:  { name:"Global X Uranium",        sector:"Uranio",                color:"#86efac" },
  IEMG: { name:"iShares Core EM",         sector:"Emergentes Core",       color:"#fca5a5" },
  ACWI: { name:"iShares MSCI ACWI",       sector:"Global All-Cap",        color:"#93c5fd" },
  ARKK: { name:"ARK Innovation",          sector:"Innovación Disruptiva", color:"#d8b4fe" },
};
const TICKERS = Object.keys(ETF_META);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#070b14;--bg1:#0d1422;--bg2:#111827;--bg3:#1a2235;
    --border:#1e2d45;--teal:#00d4c8;--blue:#38bdf8;--green:#34d399;
    --red:#f87171;--yellow:#fbbf24;--purple:#a78bfa;
    --muted:#4a6080;--text:#c8d6e5;--text2:#7a95b0;
  }
  body{font-family:'IBM Plex Mono',monospace;background:var(--bg);color:var(--text);min-height:100vh}
  .app{display:flex;flex-direction:column;min-height:100vh}

  /* HEADER */
  .hdr{display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:52px;
    background:var(--bg1);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100}
  .hdr-logo{display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600;
    letter-spacing:.08em;color:var(--teal)}
  .hdr-logo .dot{width:8px;height:8px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px var(--teal)}
  .hdr-sub{font-size:10px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
  .hdr-right{display:flex;align-items:center;gap:16px;font-size:10px;color:var(--muted)}
  .badge-live{display:flex;align-items:center;gap:5px;color:var(--green);font-size:9px;
    letter-spacing:.1em;border:1px solid rgba(52,211,153,.3);padding:2px 8px;border-radius:2px}
  .badge-live::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 1.5s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

  /* LAYOUT */
  .layout{display:grid;grid-template-columns:280px 1fr;gap:0;flex:1}

  /* SIDEBAR */
  .sidebar{background:var(--bg1);border-right:1px solid var(--border);
    padding:16px 0;overflow-y:auto;height:calc(100vh - 52px);position:sticky;top:52px}
  .sb-section{padding:0 16px 16px;border-bottom:1px solid var(--border);margin-bottom:8px}
  .sb-label{font-size:9px;font-weight:600;letter-spacing:.15em;color:var(--muted);
    text-transform:uppercase;margin-bottom:10px}

  /* INPUTS */
  .field{margin-bottom:10px}
  .field label{display:block;font-size:9px;color:var(--text2);letter-spacing:.1em;
    text-transform:uppercase;margin-bottom:5px}
  .field input,.field select{width:100%;background:var(--bg3);border:1px solid var(--border);
    border-radius:3px;color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:11px;
    padding:7px 10px;outline:none;transition:border-color .15s}
  .field input:focus,.field select:focus{border-color:var(--teal)}
  .field input[type=range]{background:var(--border);height:3px;padding:0;border:none;cursor:pointer}
  .field input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;
    border-radius:50%;background:var(--teal);cursor:pointer;box-shadow:0 0 6px var(--teal)}
  .range-row{display:flex;justify-content:space-between;font-size:9px;color:var(--text2);margin-bottom:4px}
  .range-row span{color:var(--teal)}

  /* ETF CHIPS */
  .etf-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
  .etf-chip{padding:5px 8px;border:1px solid var(--border);border-radius:3px;font-size:9px;
    font-weight:500;cursor:pointer;transition:all .12s;color:var(--text2);background:transparent;
    text-align:center;font-family:'IBM Plex Mono',monospace}
  .etf-chip:hover{border-color:var(--teal);color:var(--text)}
  .etf-chip.sel{background:rgba(0,212,200,.1);border-color:var(--teal);color:var(--teal)}
  .sel-all-btn{width:100%;margin-bottom:6px;padding:5px;background:transparent;
    border:1px solid var(--border);border-radius:3px;color:var(--muted);
    font-family:'IBM Plex Mono',monospace;font-size:9px;cursor:pointer;transition:all .15s}
  .sel-all-btn:hover{border-color:var(--teal);color:var(--teal)}

  /* RUN BUTTON */
  .run-btn{width:100%;padding:11px;background:rgba(0,212,200,.1);
    border:1px solid rgba(0,212,200,.4);border-radius:3px;color:var(--teal);
    font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;
    cursor:pointer;transition:all .15s;letter-spacing:.05em;margin-top:4px}
  .run-btn:hover:not(:disabled){background:rgba(0,212,200,.18);border-color:var(--teal)}
  .run-btn:disabled{opacity:.4;cursor:not-allowed}

  /* PROGRESS */
  .progress-wrap{margin-top:10px}
  .progress-bar-bg{height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:6px}
  .progress-bar-fill{height:100%;background:var(--teal);border-radius:2px;transition:width .3s ease}
  .progress-log{font-size:9px;color:var(--muted);line-height:1.8}
  .progress-log span{display:block}
  .progress-log span.done{color:var(--green)}
  .progress-log span.active{color:var(--teal)}

  /* MAIN */
  .main{padding:16px;overflow-y:auto;height:calc(100vh - 52px)}
  .sec-title{font-size:9px;letter-spacing:.15em;color:var(--muted);text-transform:uppercase;
    margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .sec-title::after{content:'';flex:1;height:1px;background:var(--border)}

  /* CARDS */
  .card{background:var(--bg2);border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:12px}
  .card-hdr{display:flex;align-items:center;justify-content:space-between;
    padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg3)}
  .card-title{font-size:9px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text2)}
  .card-body{padding:14px}

  /* METRIC GRID */
  .metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
  .metric-card{background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:14px}
  .metric-lbl{font-size:8px;letter-spacing:.12em;color:var(--muted);text-transform:uppercase;margin-bottom:6px}
  .metric-val{font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1}
  .metric-sub{font-size:9px;color:var(--muted);margin-top:4px}
  .pos{color:var(--green)} .neg{color:var(--red)} .neu{color:var(--yellow)}

  /* WEIGHT BARS */
  .weight-row{display:flex;align-items:center;gap:8px;margin-bottom:7px}
  .weight-ticker{font-size:9px;font-weight:600;width:42px;color:var(--text)}
  .weight-bar-bg{flex:1;background:rgba(30,45,69,.8);height:14px;border-radius:2px;overflow:hidden}
  .weight-bar-fill{height:100%;border-radius:2px;transition:width .5s ease}
  .weight-pct{font-size:9px;color:var(--text2);width:36px;text-align:right}
  .weight-sector{font-size:8px;color:var(--muted);width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  /* SIGNAL GRID */
  .signal-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .signal-box{background:var(--bg3);border:1px solid var(--border);border-radius:3px;padding:10px;text-align:center}
  .signal-num{font-size:20px;font-weight:600}
  .signal-lbl{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-top:3px}

  /* REGIME */
  .regime-badge{font-size:9px;padding:3px 8px;border-radius:2px;font-weight:600}
  .reg-bull{background:rgba(52,211,153,.12);color:var(--green)}
  .reg-bear{background:rgba(248,113,113,.12);color:var(--red)}
  .reg-mixed{background:rgba(251,191,36,.12);color:var(--yellow)}

  /* FRONTIER TABLE */
  .tbl{width:100%;border-collapse:collapse;font-size:10px}
  .tbl th{text-align:left;padding:6px 10px;font-size:8px;color:var(--muted);letter-spacing:.1em;
    text-transform:uppercase;border-bottom:1px solid var(--border);font-weight:500}
  .tbl td{padding:8px 10px;border-bottom:1px solid rgba(30,45,69,.5)}
  .tbl tr:hover td{background:rgba(0,212,200,.03)}

  /* EMPTY STATE */
  .empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
    height:60vh;gap:12px;color:var(--muted)}
  .empty-icon{font-size:40px;opacity:.3}
  .empty-title{font-size:13px;font-weight:600;letter-spacing:.05em;color:var(--text2)}
  .empty-sub{font-size:10px;line-height:1.7;text-align:center;max-width:340px}

  /* TOOLTIP */
  .tt{background:var(--bg3);border:1px solid var(--border);padding:8px 12px;border-radius:3px;font-size:10px}
  .tt .ttl{color:var(--muted);font-size:9px;margin-bottom:4px}

  /* ERROR */
  .error-box{background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.3);
    border-radius:3px;padding:12px 14px;font-size:10px;color:var(--red);line-height:1.7;margin-top:8px}

  /* DIVIDER */
  .div{height:1px;background:var(--border);margin:12px 0}

  /* TWO COL */
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
  .three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}

  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
`;

// ─── MATH UTILITIES ───────────────────────────────────────────────────────────

function logReturns(prices) {
  const r = [];
  for (let i = 1; i < prices.length; i++)
    r.push(Math.log(prices[i] / prices[i - 1]));
  return r;
}

function mean(arr) { return arr.reduce((s, x) => s + x, 0) / arr.length; }
function variance(arr) { const m = mean(arr); return mean(arr.map(x => (x - m) ** 2)); }
function std(arr) { return Math.sqrt(variance(arr)); }

function percentile(arr, p) {
  const s = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

function cov(a, b) {
  const ma = mean(a), mb = mean(b);
  return mean(a.map((x, i) => (x - ma) * (b[i] - mb)));
}

// GJR-GARCH(1,1) estimation via MLE approximation
function fitGJRGARCH(returns) {
  const n = returns.length;
  // Initial params: omega, alpha, gamma (asymmetry), beta
  let omega = 0.00001, alpha = 0.05, gamma = 0.08, beta = 0.88;
  const h = new Array(n).fill(variance(returns));

  // Iterative estimation (simplified EM-style)
  for (let iter = 0; iter < 50; iter++) {
    let newOmega = 0, newAlpha = 0, newGamma = 0, newBeta = 0;
    let totalW = 0;
    for (let t = 1; t < n; t++) {
      const r = returns[t - 1];
      const indicator = r < 0 ? 1 : 0;
      h[t] = omega + alpha * r * r + gamma * r * r * indicator + beta * h[t - 1];
      if (h[t] < 1e-10) h[t] = 1e-10;
      const w = 1 / h[t];
      newOmega  += w * (h[t] - alpha * r * r - gamma * r * r * indicator - beta * h[t - 1]);
      newAlpha  += w * r * r;
      newGamma  += w * r * r * indicator;
      newBeta   += w * h[t - 1];
      totalW += w;
    }
    omega = Math.max(1e-8, newOmega / totalW * 0.01 + omega * 0.99);
    alpha = Math.min(0.3, Math.max(0.01, newAlpha / totalW * 0.01 + alpha * 0.99));
    gamma = Math.min(0.3, Math.max(0.0,  newGamma / totalW * 0.01 + gamma * 0.99));
    beta  = Math.min(0.97,Math.max(0.5,  newBeta  / totalW * 0.01 + beta  * 0.99));
  }

  // Forecast next-period variance
  const lastR = returns[n - 1];
  const indicator = lastR < 0 ? 1 : 0;
  const hForecast = omega + alpha * lastR * lastR + gamma * lastR * lastR * indicator + beta * h[n - 1];
  const condVol = Math.sqrt(hForecast * 252); // annualized

  return { omega, alpha, gamma, beta, condVol, h };
}

// ─── HMM 3-STATE (Bull / Lateral / Bear) — Baum-Welch + Viterbi ─────────────
// States: 0=Bear, 1=Lateral, 2=Bull

function gaussianPdf(x, mu, sigma) {
  if (sigma < 1e-10) return x === mu ? 1 : 0;
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

function fitHMM(returns) {
  const n = returns.length;
  const K = 3; // states: 0=Bear, 1=Lateral, 2=Bull

  // --- Initialize parameters using percentiles ---
  const sorted = [...returns].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(n * 0.33)];
  const p67 = sorted[Math.floor(n * 0.67)];

  // Emission params per state [Bear, Lateral, Bull]
  let mu    = [mean(sorted.slice(0, Math.floor(n*0.33))), mean(sorted.slice(Math.floor(n*0.33), Math.floor(n*0.67))), mean(sorted.slice(Math.floor(n*0.67)))];
  let sigma = [std(sorted.slice(0, Math.floor(n*0.33))) || 0.01, std(sorted.slice(Math.floor(n*0.33), Math.floor(n*0.67))) || 0.005, std(sorted.slice(Math.floor(n*0.67))) || 0.01];

  // Transition matrix — favour staying in same state
  let A = [
    [0.85, 0.10, 0.05],
    [0.10, 0.80, 0.10],
    [0.05, 0.10, 0.85],
  ];

  // Initial state distribution
  let pi = [0.33, 0.34, 0.33];

  // --- Baum-Welch EM iterations ---
  const MAX_ITER = 30;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    // E-step: forward-backward
    // Forward pass (scaled)
    const alpha = [];
    const scale = new Array(n).fill(0);
    alpha[0] = pi.map((p, k) => p * gaussianPdf(returns[0], mu[k], sigma[k]));
    scale[0] = alpha[0].reduce((s, x) => s + x, 0) || 1e-300;
    alpha[0] = alpha[0].map(x => x / scale[0]);

    for (let t = 1; t < n; t++) {
      alpha[t] = Array(K).fill(0);
      for (let j = 0; j < K; j++) {
        let s = 0;
        for (let i = 0; i < K; i++) s += alpha[t-1][i] * A[i][j];
        alpha[t][j] = s * gaussianPdf(returns[t], mu[j], sigma[j]);
      }
      scale[t] = alpha[t].reduce((s, x) => s + x, 0) || 1e-300;
      alpha[t] = alpha[t].map(x => x / scale[t]);
    }

    // Backward pass (scaled)
    const beta = Array(n).fill(null).map(() => Array(K).fill(0));
    beta[n-1] = Array(K).fill(1);
    for (let t = n-2; t >= 0; t--) {
      for (let i = 0; i < K; i++) {
        let s = 0;
        for (let j = 0; j < K; j++)
          s += A[i][j] * gaussianPdf(returns[t+1], mu[j], sigma[j]) * beta[t+1][j];
        beta[t][i] = s / scale[t+1];
      }
    }

    // Gamma and Xi
    const gamma = alpha.map((a, t) => {
      const s = a.reduce((sum, x, k) => sum + x * beta[t][k], 0) || 1e-300;
      return a.map((x, k) => x * beta[t][k] / s);
    });

    const xi = Array(n-1).fill(null).map((_, t) => {
      const mat = Array(K).fill(null).map(() => Array(K).fill(0));
      let norm = 0;
      for (let i = 0; i < K; i++)
        for (let j = 0; j < K; j++) {
          mat[i][j] = alpha[t][i] * A[i][j] * gaussianPdf(returns[t+1], mu[j], sigma[j]) * beta[t+1][j];
          norm += mat[i][j];
        }
      norm = norm || 1e-300;
      return mat.map(row => row.map(v => v / norm));
    });

    // M-step: update parameters
    pi = gamma[0].map(g => Math.max(g, 1e-6));
    const piSum = pi.reduce((s, x) => s + x, 0);
    pi = pi.map(p => p / piSum);

    // Update A
    for (let i = 0; i < K; i++) {
      const rowSum = xi.reduce((s, x) => s + x[i].reduce((a, b) => a + b, 0), 0) || 1e-300;
      for (let j = 0; j < K; j++) {
        A[i][j] = Math.max(xi.reduce((s, x) => s + x[i][j], 0) / rowSum, 1e-6);
      }
      const aSum = A[i].reduce((s, x) => s + x, 0);
      A[i] = A[i].map(v => v / aSum);
    }

    // Update emission params
    for (let k = 0; k < K; k++) {
      const gk = gamma.map(g => g[k]);
      const gkSum = gk.reduce((s, x) => s + x, 0) || 1e-300;
      mu[k] = gk.reduce((s, g, t) => s + g * returns[t], 0) / gkSum;
      const v = gk.reduce((s, g, t) => s + g * (returns[t] - mu[k]) ** 2, 0) / gkSum;
      sigma[k] = Math.max(Math.sqrt(v), 1e-4);
    }
  }

  // --- Viterbi decoding ---
  const viterbi = Array(n).fill(null).map(() => Array(K).fill(0));
  const psi     = Array(n).fill(null).map(() => Array(K).fill(0));
  for (let k = 0; k < K; k++)
    viterbi[0][k] = Math.log(pi[k] + 1e-300) + Math.log(gaussianPdf(returns[0], mu[k], sigma[k]) + 1e-300);

  for (let t = 1; t < n; t++) {
    for (let j = 0; j < K; j++) {
      let best = -Infinity, bestK = 0;
      for (let i = 0; i < K; i++) {
        const v = viterbi[t-1][i] + Math.log(A[i][j] + 1e-300);
        if (v > best) { best = v; bestK = i; }
      }
      viterbi[t][j] = best + Math.log(gaussianPdf(returns[t], mu[j], sigma[j]) + 1e-300);
      psi[t][j] = bestK;
    }
  }

  // Backtrack
  const stateSeq = new Array(n);
  stateSeq[n-1] = viterbi[n-1].indexOf(Math.max(...viterbi[n-1]));
  for (let t = n-2; t >= 0; t--) stateSeq[t] = psi[t+1][stateSeq[t+1]];

  // Current regime: majority of last 20 days
  const recent = stateSeq.slice(-20);
  const counts = [0, 0, 0];
  recent.forEach(s => counts[s]++);
  const currentStateIdx = counts.indexOf(Math.max(...counts));
  const regimeMap = ["bear", "lateral", "bull"];
  const currentRegime = regimeMap[currentStateIdx];
  const regimeConf = counts[currentStateIdx] / 20;

  // State fractions
  const stateFractions = counts.map(c => +(c / 20).toFixed(2));

  // Emission stats per state
  const stateStats = [0,1,2].map(k => ({
    label: ["Bear","Lateral","Bull"][k],
    mu:    +(mu[k] * 252 * 100).toFixed(2),   // annualized %
    sigma: +(sigma[k] * Math.sqrt(252) * 100).toFixed(2),
    days:  stateSeq.filter(s => s === k).length,
  }));

  return { A, mu, sigma, pi, stateSeq, currentRegime, regimeConf, stateFractions, stateStats };
}

// CVaR calculation
function calcCVaR(returns, alpha = 0.05) {
  const sorted = [...returns].sort((a, b) => a - b);
  const cutoff = Math.floor(alpha * sorted.length);
  const tail = sorted.slice(0, cutoff);
  return tail.length > 0 ? mean(tail) : sorted[0];
}

// Portfolio CVaR (Monte Carlo)
function portfolioCVaR(weights, retMatrix, nSim = 2000, alpha = 0.05) {
  const tickers = Object.keys(weights);
  const portRets = [];
  const n = retMatrix[tickers[0]].length;
  for (let s = 0; s < nSim; s++) {
    const idx = Math.floor(Math.random() * n);
    let r = 0;
    for (const t of tickers) r += weights[t] * retMatrix[t][idx];
    portRets.push(r);
  }
  return calcCVaR(portRets, alpha) * Math.sqrt(252);
}

// Mean-CVaR optimization via random portfolio search + gradient refinement
function optimizeCVaR(retMatrix, selectedTickers, nIter = 3000, riskAversion = 3) {
  const n = selectedTickers.length;
  if (n === 0) return {};

  const means = {};
  const gjrVols = {};
  const hmms = {};
  for (const t of selectedTickers) {
    means[t] = mean(retMatrix[t]) * 252;
    const gjr = fitGJRGARCH(retMatrix[t]);
    gjrVols[t] = gjr.condVol;
    hmms[t] = fitHMM(retMatrix[t]);
  }

  // Regime-adjusted expected returns (3 states)
  const adjMeans = {};
  for (const t of selectedTickers) {
    const hmm = hmms[t];
    const regimeAdj = hmm.currentRegime === "bull" ? 1.15
                    : hmm.currentRegime === "lateral" ? 1.0
                    : 0.80;
    adjMeans[t] = means[t] * regimeAdj;
  }

  let bestWeights = null;
  let bestScore = -Infinity;

  // Random portfolio search
  for (let i = 0; i < nIter; i++) {
    // Dirichlet-like random weights
    const raw = selectedTickers.map(() => Math.random() ** 2);
    const sum = raw.reduce((s, x) => s + x, 0);
    const w = {};
    selectedTickers.forEach((t, j) => { w[t] = raw[j] / sum; });

    // Enforce max weight 40%
    let violated = false;
    for (const t of selectedTickers) {
      if (w[t] > 0.40) { violated = true; break; }
    }
    if (violated) continue;

    const portRet = selectedTickers.reduce((s, t) => s + w[t] * adjMeans[t], 0);
    const portCVaR = portfolioCVaR(w, retMatrix, 500, 0.05);
    const score = portRet - riskAversion * Math.abs(portCVaR);
    if (score > bestScore) {
      bestScore = score;
      bestWeights = { ...w };
    }
  }

  // Remove near-zero weights
  if (bestWeights) {
    for (const t of selectedTickers) {
      if (bestWeights[t] < 0.01) delete bestWeights[t];
    }
    // Renormalize
    const s = Object.values(bestWeights).reduce((a, b) => a + b, 0);
    for (const t of Object.keys(bestWeights)) bestWeights[t] /= s;
  }

  return bestWeights || {};
}

// Efficient frontier points
function buildFrontier(retMatrix, selectedTickers, nPoints = 18) {
  const points = [];
  for (let i = 0; i < nPoints; i++) {
    const riskAversion = 0.5 + i * 1.5;
    const w = optimizeCVaR(retMatrix, selectedTickers, 800, riskAversion);
    if (!w || Object.keys(w).length === 0) continue;
    const tickers = Object.keys(w);
    const portRet = tickers.reduce((s, t) => s + w[t] * mean(retMatrix[t]) * 252, 0);
    const portVol = calcPortfolioVol(w, retMatrix);
    const portCVaR = portfolioCVaR(w, retMatrix, 400, 0.05);
    points.push({
      vol: +(portVol * 100).toFixed(2),
      ret: +(portRet * 100).toFixed(2),
      cvar: +(portCVaR * 100).toFixed(2),
      sharpe: portVol > 0 ? +((portRet - 0.043) / portVol).toFixed(3) : 0,
    });
  }
  return points.sort((a, b) => a.vol - b.vol);
}

function calcPortfolioVol(weights, retMatrix) {
  const tickers = Object.keys(weights);
  let vol2 = 0;
  for (const ti of tickers) {
    for (const tj of tickers) {
      vol2 += weights[ti] * weights[tj] * cov(retMatrix[ti], retMatrix[tj]);
    }
  }
  return Math.sqrt(Math.max(0, vol2) * 252);
}

// OR Signals: stop-loss (D1 = P10 anual) and take-profit (D9 = P90 anual)
function calcORSignals(returns) {
  // Aggregate daily returns into annual rolling windows (252-day)
  const annualReturns = [];
  for (let i = 252; i <= returns.length; i++) {
    const window = returns.slice(i - 252, i);
    const annRet = window.reduce((acc, r) => acc * (1 + r), 1) - 1;
    annualReturns.push(annRet);
  }
  // Fallback: annualize daily if not enough history
  const dist = annualReturns.length >= 20 ? annualReturns
    : returns.map(r => r * 252);
  const stopLoss   = percentile(dist, 10);  // Decil 1
  const takeProfit = percentile(dist, 90);  // Decil 9
  return {
    stopLoss:    +(stopLoss  * 100).toFixed(2),
    takeProfit:  +(takeProfit * 100).toFixed(2),
    decil1: +(stopLoss  * 100).toFixed(2),
    decil9: +(takeProfit * 100).toFixed(2),
  };
}

// Per-asset OR signals — D1 (P10) y D9 (P90) anuales + señal OR activa
function calcAssetORSignals(retMatrix, weights, waitDays) {
  const today = new Date();
  const assetSignals = {};
  for (const ticker of Object.keys(weights)) {
    const rets = retMatrix[ticker];
    // Build annual return distribution
    const annualReturns = [];
    for (let i = 252; i <= rets.length; i++) {
      const window = rets.slice(i - 252, i);
      const annRet = window.reduce((acc, r) => acc * (1 + r), 1) - 1;
      annualReturns.push(annRet);
    }
    const dist = annualReturns.length >= 20 ? annualReturns : rets.map(r => r * 252);
    const sl = percentile(dist, 10);
    const tp = percentile(dist, 90);
    const vol = std(rets) * Math.sqrt(252);
    // Check last return against daily SL/TP thresholds
    const lastRet = rets[rets.length - 1];
    const dailySL = percentile(rets, 5);
    const dailyTP = percentile(rets, 95);
    const slTriggered = lastRet <= dailySL;
    const tpTriggered = lastRet >= dailyTP;
    const signalActive = slTriggered || tpTriggered;
    const signalType = slTriggered ? "SL" : tpTriggered ? "TP" : null;
    // Re-entry date = today + waitDays (business days approx)
    const reEntry = new Date(today);
    reEntry.setDate(reEntry.getDate() + waitDays);
    assetSignals[ticker] = {
      stopLoss:    +(sl * 100).toFixed(2),
      takeProfit:  +(tp * 100).toFixed(2),
      vol:         +(vol * 100).toFixed(1),
      signalActive,
      signalType,
      reEntryDate: signalActive ? reEntry.toISOString().slice(0,10) : null,
    };
  }
  return assetSignals;
}

// Next rebalance dates — fixed monthly from portfolio start date
function calcRebalanceDates(dateFrom) {
  const start = new Date(dateFrom);
  const rebalDay = start.getDate(); // same day each month
  const today = new Date();
  const dates = [];
  let d = new Date(today.getFullYear(), today.getMonth(), rebalDay);
  // If this month's rebal already passed, start from next month
  if (d <= today) d = new Date(d.getFullYear(), d.getMonth() + 1, rebalDay);
  for (let i = 0; i < 3; i++) {
    const rd = new Date(d.getFullYear(), d.getMonth() + i, rebalDay);
    dates.push({ date: rd.toISOString().slice(0,10), label: `Rebalanceo mensual (día ${rebalDay})` });
  }
  return dates;
}

// Risk contribution per asset: weight * marginal contribution to portfolio vol
function calcRiskContributions(weights, retMatrix) {
  const tickers = Object.keys(weights);
  const portVol = calcPortfolioVol(weights, retMatrix);
  if (portVol === 0) return tickers.map(t => ({ ticker: t, rc: 0, rcPct: 0 }));
  return tickers.map(t => {
    let covWithPort = 0;
    for (const t2 of tickers)
      covWithPort += weights[t2] * cov(retMatrix[t], retMatrix[t2]);
    const marginal = covWithPort * 252 / portVol;
    const rc = weights[t] * marginal;
    return {
      ticker: t,
      rc:    +(rc * 100).toFixed(3),
      rcPct: +(rc / portVol * 100).toFixed(1),
      fill:  ETF_META[t]?.color || "var(--teal)",
    };
  }).sort((a, b) => b.rcPct - a.rcPct);
}

// Sensitivity table: vary lambda, compute portfolio metrics
function buildSensitivity(retMatrix, selectedTickers, currentLambda) {
  const lambdas = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];
  return lambdas.map(lam => {
    const w = optimizeCVaR(retMatrix, selectedTickers, 600, lam);
    if (!w || Object.keys(w).length === 0) return null;
    const tks = Object.keys(w);
    const portRet = tks.reduce((s, t) => s + w[t] * mean(retMatrix[t]) * 252, 0);
    const portVol = calcPortfolioVol(w, retMatrix);
    const portCVaR = portfolioCVaR(w, retMatrix, 400, 0.05);
    const sharpe = portVol > 0 ? (portRet - 0.043) / portVol : 0;
    let nav = 100, peak = 100, maxDD = 0;
    const nDays = retMatrix[tks[0]].length;
    for (let i = 0; i < nDays; i++) {
      let r = 0;
      for (const t of tks) r += w[t] * retMatrix[t][i];
      nav *= (1 + r);
      if (nav > peak) peak = nav;
      const dd = (nav - peak) / peak;
      if (dd < maxDD) maxDD = dd;
    }
    return {
      lambda: lam,
      ret:    +(portRet  * 100).toFixed(2),
      vol:    +(portVol  * 100).toFixed(2),
      sharpe: +sharpe.toFixed(3),
      cvar:   +(portCVaR * 100).toFixed(2),
      maxDD:  +(maxDD    * 100).toFixed(2),
      nAssets: Object.keys(w).length,
      isActive: lam === currentLambda,
    };
  }).filter(Boolean);
}

// ─── FMP API ──────────────────────────────────────────────────────────────────
async function fetchPrices(ticker, from, to, _apiKey) {
  const url = `/yahoo/${ticker}?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${ticker}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  if (!data.prices || data.prices.length === 0)
    throw new Error(`No data for ${ticker}`);
  return data.prices;
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const FrontierTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tt">
      <div className="ttl">Portafolio</div>
      <div style={{ color:"var(--blue)" }}>Riesgo: {d.vol}%</div>
      <div style={{ color:"var(--green)" }}>Retorno: {d.ret}%</div>
      <div style={{ color:"var(--yellow)" }}>Sharpe: {d.sharpe}</div>
      <div style={{ color:"var(--red)" }}>CVaR: {d.cvar}%</div>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey]         = useState("");
  const [dateFrom, setDateFrom]     = useState("2022-01-01");
  const [dateTo, setDateTo]         = useState(new Date().toISOString().slice(0, 10));
  const [selectedETFs, setSelected] = useState(new Set(["SPY","QQQ","GLD","IVW","IVE","EFA","IJH","ITA","ACWI","EWJ"]));
  const [riskAv, setRiskAv]         = useState(3);
  const [waitDays, setWaitDays]     = useState(5);

  const [running, setRunning]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs]         = useState([]);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState(null);

  const addLog = (msg, done = false) =>
    setLogs(l => [...l, { msg, done }]);

  const toggleETF = t =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const toggleAll = () =>
    setSelected(prev => prev.size === TICKERS.length ? new Set() : new Set(TICKERS));

  const run = useCallback(async () => {
    if (selectedETFs.size < 3) { setError("Seleccioná al menos 3 ETFs."); return; }
    setRunning(true); setError(""); setResult(null); setLogs([]); setProgress(0);

    const tickers = [...selectedETFs];
    const retMatrix = {};
    let fetched = 0;

    try {
      // 1. Fetch prices
      for (const t of tickers) {
        setLogs(l => {
          const next = l.filter(x => !x.active);
          return [...next.map(x => ({ ...x, done: true })), { msg: `↓ Descargando ${t}…`, active: true }];
        });
        const prices = await fetchPrices(t, dateFrom, dateTo, apiKey.trim());
        retMatrix[t] = logReturns(prices);
        fetched++;
        setProgress(Math.round((fetched / tickers.length) * 40));
        await new Promise(r => setTimeout(r, 120)); // rate limit
      }

      setLogs(l => l.map(x => ({ ...x, done: true, active: false })));
      addLog("✓ Precios descargados", true);
      setProgress(42);

      // 2. GJR-GARCH per asset
      addLog("⟳ Calibrando GJR-GARCH…");
      const gjrResults = {};
      for (const t of tickers) gjrResults[t] = fitGJRGARCH(retMatrix[t]);
      setProgress(58);
      addLog("✓ GJR-GARCH calibrado", true);

      // 3. HMM regime detection
      addLog("⟳ Detectando regímenes HMM…");
      const hmmResults = {};
      for (const t of tickers) hmmResults[t] = fitHMM(retMatrix[t]);
      setProgress(68);

      // Dominant regime across portfolio (3 states)
      const regimeCounts = { bull: 0, lateral: 0, bear: 0 };
      tickers.forEach(t => { regimeCounts[hmmResults[t].currentRegime]++; });
      const dominantRegime = Object.entries(regimeCounts).sort((a,b) => b[1]-a[1])[0][0];
      const regimeLabel3 = { bull:"ALCISTA", lateral:"LATERAL", bear:"BAJISTA" }[dominantRegime];
      addLog(`✓ Régimen detectado: ${regimeLabel3} (Bull:${regimeCounts.bull} Lat:${regimeCounts.lateral} Bear:${regimeCounts.bear})`, true);

      // 4. CVaR optimization
      addLog("⟳ Optimizando portafolio (Mean-CVaR + GJR)…");
      setProgress(72);
      await new Promise(r => setTimeout(r, 10));
      const optWeights = optimizeCVaR(retMatrix, tickers, 4000, riskAv);
      setProgress(88);
      addLog("✓ Portafolio optimizado", true);

      // 5. OR signals
      addLog("⟳ Calculando señales OR…");
      const portTickers = Object.keys(optWeights);
      const portDailyRets = [];
      const nDays = retMatrix[portTickers[0]].length;
      for (let i = 0; i < nDays; i++) {
        let r = 0;
        for (const t of portTickers) r += optWeights[t] * retMatrix[t][i];
        portDailyRets.push(r);
      }
      const orSignals = calcORSignals(portDailyRets);
      setProgress(93);
      addLog("✓ Señales OR calculadas", true);

      // 6. Frontier
      addLog("⟳ Construyendo frontera eficiente…");
      const frontier = buildFrontier(retMatrix, tickers, 16);
      setProgress(98);
      addLog("✓ Frontera eficiente construida", true);

      // 7. Final metrics
      const portRet = portTickers.reduce((s, t) => s + optWeights[t] * mean(retMatrix[t]) * 252, 0);
      const portVol = calcPortfolioVol(optWeights, retMatrix);
      const portCVaR = portfolioCVaR(optWeights, retMatrix, 2000, 0.05);
      const sharpe = (portRet - 0.043) / portVol;

      // Max drawdown simulation
      let nav = 100, peak = 100, maxDD = 0;
      for (const r of portDailyRets) {
        nav *= (1 + r);
        if (nav > peak) peak = nav;
        const dd = (nav - peak) / peak;
        if (dd < maxDD) maxDD = dd;
      }
      const calmar = portRet / Math.abs(maxDD);

      // Sector exposure
      const sectorExp = {};
      for (const t of portTickers) {
        const sec = ETF_META[t]?.sector || "Otro";
        sectorExp[sec] = (sectorExp[sec] || 0) + optWeights[t];
      }

      setProgress(100);
      addLog("✓ Modelo GJR+OR completado", true);

      // Per-asset OR signals
      const assetSignals = calcAssetORSignals(retMatrix, optWeights, waitDays);
      const rebalDates = calcRebalanceDates(dateFrom);

      addLog("⟳ Calculando contribución al riesgo y sensibilidad…");
      const riskContrib = calcRiskContributions(optWeights, retMatrix);
      const sensitivity = buildSensitivity(retMatrix, tickers, riskAv);
      setProgress(99);
      addLog("✓ Análisis completado", true);

      setResult({
        weights: optWeights,
        gjr: gjrResults,
        hmm: hmmResults,
        dominantRegime,
        assetSignals,
        rebalDates,
        riskContrib,
        sensitivity,
        metrics: {
          ret:    +(portRet  * 100).toFixed(2),
          vol:    +(portVol  * 100).toFixed(2),
          sharpe: +sharpe.toFixed(3),
          cvar:   +(portCVaR * 100).toFixed(2),
          maxDD:  +(maxDD    * 100).toFixed(2),
          calmar: +calmar.toFixed(3),
        },
        orSignals,
        waitDays,
        frontier,
        sectorExp,
        dateFrom, dateTo,
        nDays,
      });
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setRunning(false);
  }, [apiKey, selectedETFs, dateFrom, dateTo, riskAv, waitDays]);

  const sortedW = result
    ? Object.entries(result.weights).sort((a, b) => b[1] - a[1])
    : [];
  const maxW = sortedW[0]?.[1] || 0.4;

  const sectorData = result
    ? Object.entries(result.sectorExp).map(([name, value]) => ({
        name, value: +(value * 100).toFixed(1)
      })).sort((a, b) => b.value - a.value)
    : [];

  const regimeLabel = result?.dominantRegime === "bull" ? "ALCISTA"
                   : result?.dominantRegime === "lateral" ? "LATERAL" : "BAJISTA";
  const regimeClass = result?.dominantRegime === "bull" ? "reg-bull"
                    : result?.dominantRegime === "lateral" ? "reg-mixed" : "reg-bear";



  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* HEADER */}
        <header className="hdr">
          <div className="hdr-logo">
            <div className="dot" />
            <div>
              <div>GJR+OR — PORTFOLIO OPTIMIZER</div>
              <div className="hdr-sub">GJR-GARCH · HMM · CVaR · Opciones Reales · BYMA CEDEARs</div>
            </div>
          </div>
          <div className="hdr-right">
            {result && (
              <div className={`regime-badge ${regimeClass}`}>RÉGIMEN {regimeLabel}</div>
            )}
            <div className="badge-live">LIVE DATA</div>
            <span>{selectedETFs.size} ETFs seleccionados</span>
          </div>
        </header>

        <div className="layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            {/* Data source note */}
            <div className="sb-section">
              <div className="sb-label">Fuente de datos</div>
              <div style={{fontSize:"9px", color:"var(--muted)", lineHeight:1.7}}>
                <span style={{color:"var(--green)"}}>● Yahoo Finance</span><br/>
                Precios históricos ajustados<br/>
                Sin API key requerida · Gratuito
              </div>
            </div>

            {/* Period */}
            <div className="sb-section">
              <div className="sb-label">Período de calibración</div>
              <div className="field">
                <label>Fecha desde</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="field">
                <label>Fecha hasta</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
            </div>

            {/* Model params */}
            <div className="sb-section">
              <div className="sb-label">Parámetros del modelo</div>
              <div className="field">
                <div className="range-row">
                  <span>Aversión al riesgo (λ)</span>
                  <span>{riskAv.toFixed(1)}</span>
                </div>
                <input type="range" min="0.5" max="8" step="0.5" value={riskAv}
                  onChange={e => setRiskAv(+e.target.value)} />
                <div style={{fontSize:"8px", color:"var(--muted)", marginTop:4, lineHeight:1.6}}>
                  Bajo → mayor retorno esperado<br/>
                  Alto → menor CVaR / drawdown
                </div>
              </div>
              <div className="field">
                <div className="range-row">
                  <span>Wait days post-señal OR</span>
                  <span>{waitDays}d</span>
                </div>
                <input type="range" min="0" max="15" value={waitDays}
                  onChange={e => setWaitDays(+e.target.value)} />
              </div>
              <div style={{fontSize:"9px", color:"var(--muted)", lineHeight:1.7, marginTop:4}}>
                Stop-loss = P5 retorno diario<br/>
                Take-profit = P99 retorno diario<br/>
                TC = 0.5025% por operación
              </div>
            </div>

            {/* ETF Universe */}
            <div className="sb-section">
              <div className="sb-label">Universo BYMA CEDEARs</div>
              <button className="sel-all-btn" onClick={toggleAll}>
                {selectedETFs.size === TICKERS.length ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
              <div className="etf-grid">
                {TICKERS.map(t => (
                  <div
                    key={t}
                    className={`etf-chip ${selectedETFs.has(t) ? "sel" : ""}`}
                    title={`${ETF_META[t].name} — ${ETF_META[t].sector}`}
                    style={selectedETFs.has(t) ? {
                      borderColor: ETF_META[t].color,
                      color: ETF_META[t].color,
                      background: `${ETF_META[t].color}18`
                    } : {}}
                    onClick={() => toggleETF(t)}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Run */}
            <div style={{padding:"0 16px 16px"}}>
              <button className="run-btn" onClick={run} disabled={running}>
                {running ? "⟳ Calibrando modelo…" : "▶ Generar portafolio GJR+OR"}
              </button>

              {running && (
                <div className="progress-wrap">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{width:`${progress}%`}} />
                  </div>
                  <div className="progress-log">
                    {logs.map((l, i) => (
                      <span key={i} className={l.done ? "done" : l.active ? "active" : ""}>
                        {l.msg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="error-box">{error}</div>}
            </div>
          </aside>

          {/* MAIN */}
          <main className="main">
            {!result && !running && (
              <div className="empty">
                <div className="empty-icon">◈</div>
                <div className="empty-title">GJR+OR Portfolio Optimizer</div>
                <div className="empty-sub">
                  Ingresá tu API key de FMP, seleccioná el período y los ETFs, luego presioná
                  <strong style={{color:"var(--teal)"}}> Generar portafolio</strong> para calibrar
                  el modelo GJR-GARCH + HMM + CVaR y obtener el portafolio óptimo con señales de
                  opciones reales.
                </div>
              </div>
            )}

            {result && (
              <>
                {/* Metrics */}
                <div className="sec-title">Performance esperada del portafolio óptimo</div>
                <div className="metric-grid">
                  <div className="metric-card">
                    <div className="metric-lbl">Retorno anual esperado</div>
                    <div className={`metric-val ${result.metrics.ret >= 0 ? "pos" : "neg"}`}>
                      {result.metrics.ret > 0 ? "+" : ""}{result.metrics.ret}%
                    </div>
                    <div className="metric-sub">Ajustado por régimen HMM</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Sharpe Ratio</div>
                    <div className={`metric-val ${result.metrics.sharpe > 0.5 ? "pos" : result.metrics.sharpe > 0 ? "neu" : "neg"}`}>
                      {result.metrics.sharpe.toFixed(3)}
                    </div>
                    <div className="metric-sub">rf = 4.3% anual</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">CVaR (95%)</div>
                    <div className="metric-val neg">{result.metrics.cvar}%</div>
                    <div className="metric-sub">Pérdida esperada cola 5%</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Max Drawdown hist.</div>
                    <div className="metric-val neg">{result.metrics.maxDD}%</div>
                    <div className="metric-sub">Calmar: {result.metrics.calmar.toFixed(2)}</div>
                  </div>
                </div>

                <div className="metric-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
                  <div className="metric-card">
                    <div className="metric-lbl">Volatilidad anualizada</div>
                    <div className="metric-val neu">{result.metrics.vol}%</div>
                    <div className="metric-sub">GJR-GARCH condicional</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Régimen de mercado</div>
                    <div className={`metric-val ${result.dominantRegime === "bull" ? "pos" : result.dominantRegime === "lateral" ? "neu" : "neg"}`}>
                      {regimeLabel}
                    </div>
                    <div className="metric-sub">
                      Bull:{Object.values(result.hmm).filter(h=>h.currentRegime==="bull").length} · 
                      Lat:{Object.values(result.hmm).filter(h=>h.currentRegime==="lateral").length} · 
                      Bear:{Object.values(result.hmm).filter(h=>h.currentRegime==="bear").length}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Período calibrado</div>
                    <div className="metric-val" style={{fontSize:14,paddingTop:4}}>
                      {result.dateFrom}
                    </div>
                    <div className="metric-sub">→ {result.dateTo} · {result.nDays} ruedas</div>
                  </div>
                </div>

                {/* Weights + Sector */}
                <div className="two-col">
                  {/* Weights */}
                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Pesos óptimos — GJR+OR</span>
                      <span style={{fontSize:9,color:"var(--muted)"}}>
                        {sortedW.length} activos · Max {(maxW*100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="card-body">
                      {sortedW.map(([t, w]) => (
                        <div className="weight-row" key={t}>
                          <span className="weight-ticker">{t}</span>
                          <div className="weight-bar-bg">
                            <div className="weight-bar-fill" style={{
                              width:`${(w / maxW) * 100}%`,
                              background: ETF_META[t]?.color || "var(--teal)"
                            }} />
                          </div>
                          <span className="weight-pct">{(w*100).toFixed(1)}%</span>
                          <span className="weight-sector">{ETF_META[t]?.sector}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sector pie */}
                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Exposición sectorial</span>
                    </div>
                    <div className="card-body" style={{padding:"8px 0"}}>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={sectorData} layout="vertical" margin={{left:10,right:16,top:4,bottom:4}}>
                          <XAxis type="number" tick={{fontSize:8, fill:"var(--muted)"}} tickFormatter={v=>`${v}%`} />
                          <YAxis type="category" dataKey="name" tick={{fontSize:8, fill:"var(--text2)"}} width={130} />
                          <Tooltip formatter={v=>`${v}%`} contentStyle={{background:"var(--bg3)",border:"1px solid var(--border)",fontSize:10}} />
                          <Bar dataKey="value" radius={[0,2,2,0]}>
                            {sectorData.map((entry, i) => (
                              <Cell key={i} fill={`hsl(${190 + i * 22}, 70%, 55%)`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* HMM State Stats */}
                <div className="sec-title">Detalle regímenes HMM — 3 estados</div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="card-hdr">
                    <span className="card-title">Estadísticas por estado · Baum-Welch + Viterbi</span>
                  </div>
                  <div className="card-body" style={{padding:0}}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>ETF</th>
                          <th>Régimen actual</th>
                          <th>Confianza</th>
                          <th>μ Bear (anual)</th>
                          <th>μ Lateral (anual)</th>
                          <th>μ Bull (anual)</th>
                          <th>Días Bull / Lat / Bear</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.hmm)
                          .filter(([t]) => result.weights[t])
                          .sort((a,b) => result.weights[b[0]] - result.weights[a[0]])
                          .map(([ticker, hmm]) => (
                          <tr key={ticker}>
                            <td>
                              <span style={{
                                display:"inline-block",padding:"2px 6px",borderRadius:2,
                                fontSize:9,fontWeight:600,
                                background:`${ETF_META[ticker]?.color}22`,
                                color:ETF_META[ticker]?.color
                              }}>{ticker}</span>
                            </td>
                            <td>
                              <span className={`regime-badge ${hmm.currentRegime==="bull"?"reg-bull":hmm.currentRegime==="lateral"?"reg-mixed":"reg-bear"}`}>
                                {hmm.currentRegime==="bull"?"BULL":hmm.currentRegime==="lateral"?"LATERAL":"BEAR"}
                              </span>
                            </td>
                            <td style={{color:"var(--text2)"}}>{(hmm.regimeConf*100).toFixed(0)}%</td>
                            <td className="neg">{hmm.stateStats?.[0]?.mu ?? "—"}%</td>
                            <td className="neu">{hmm.stateStats?.[1]?.mu ?? "—"}%</td>
                            <td className="pos">{hmm.stateStats?.[2]?.mu ?? "—"}%</td>
                            <td style={{fontSize:9,color:"var(--muted)"}}>
                              {hmm.stateStats?.[2]?.days ?? 0} / {hmm.stateStats?.[1]?.days ?? 0} / {hmm.stateStats?.[0]?.days ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* OR Signals per asset */}
                <div className="sec-title">Señales de opciones reales — por activo</div>
                <div className="two-col">
                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Stop-loss y Take-profit por ETF</span>
                      <span style={{fontSize:9,color:"var(--muted)"}}>P5 / P99 retorno diario · Wait {result.waitDays}d</span>
                    </div>
                    <div className="card-body" style={{padding:0}}>
                      <table className="tbl">
                        <thead>
                          <tr>
                            <th>ETF</th>
                            <th>Peso</th>
                            <th>Stop-loss (D1)</th>
                            <th>Take-profit (D9)</th>
                            <th>Vol anual</th>
                            <th>Señal OR</th>
                            <th>Re-entrada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(result.assetSignals)
                            .sort((a,b) => result.weights[b[0]] - result.weights[a[0]])
                            .map(([ticker, sig]) => (
                            <tr key={ticker}>
                              <td>
                                <span style={{
                                  display:"inline-block",padding:"2px 6px",borderRadius:2,
                                  fontSize:9,fontWeight:600,
                                  background:`${ETF_META[ticker]?.color}22`,
                                  color: ETF_META[ticker]?.color
                                }}>{ticker}</span>
                              </td>
                              <td style={{color:"var(--text2)"}}>{(result.weights[ticker]*100).toFixed(1)}%</td>
                              <td className="neg">{sig.stopLoss}%</td>
                              <td className="pos">{sig.takeProfit}%</td>
                              <td className="neu">{sig.vol}%</td>
                              <td>
                                {sig.signalActive
                                  ? <span style={{
                                      display:"inline-block",padding:"2px 6px",borderRadius:2,
                                      fontSize:9,fontWeight:600,
                                      background: sig.signalType==="SL" ? "rgba(248,113,113,.15)" : "rgba(52,211,153,.15)",
                                      color: sig.signalType==="SL" ? "var(--red)" : "var(--green)"
                                    }}>{sig.signalType} ACTIVA</span>
                                  : <span style={{fontSize:9,color:"var(--muted)"}}>En espera</span>
                                }
                              </td>
                              <td style={{fontSize:9,color: sig.signalActive ? "var(--yellow)" : "var(--muted)"}}>
                                {sig.signalActive ? sig.reEntryDate : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Calendario de rebalanceo mensual</span>
                      <span className={`regime-badge ${result.dominantRegime === "bull" ? "reg-bull" : "reg-bear"}`}>
                        {result.dominantRegime === "bull" ? "D1 + D9" : "D5"}
                      </span>
                    </div>
                    <div className="card-body">
                      <div style={{fontSize:10,color:"var(--text2)",marginBottom:12,lineHeight:1.7}}>
                        Régimen <strong style={{color: result.dominantRegime === "bull" ? "var(--green)" : "var(--red)"}}>
                          {result.dominantRegime === "bull" ? "ALCISTA" : "BAJISTA"}
                        </strong> → rebalanceo en{" "}
                        <strong style={{color:"var(--teal)"}}>
                          {result.dominantRegime === "bull" ? "día 1 y día 9" : "día 5"} de cada mes
                        </strong>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {result.rebalDates.map((d, i) => (
                          <div key={i} style={{
                            display:"flex",alignItems:"center",gap:10,
                            background:"var(--bg3)",border:"1px solid var(--border)",
                            borderRadius:3,padding:"8px 12px"
                          }}>
                            <span style={{fontSize:11,color:"var(--teal)"}}>◈</span>
                            <span style={{fontSize:11,color:"var(--text)"}}>{d.date}</span>
                            <span style={{fontSize:9,color:"var(--muted)",marginLeft:"auto"}}>{d.label}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{marginTop:14,fontSize:9,color:"var(--muted)",lineHeight:1.7}}>
                        Stop-loss portafolio (D1): <span className="neg">{result.orSignals.stopLoss}%</span> anual ·{" "}
                        Take-profit (D9): <span className="pos">{result.orSignals.takeProfit}%</span> anual<br/>
                        TC estimado: 0.5025% por operación · Wait days: {result.waitDays}d
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frontier + GJR Vols */}
                <div className="two-col">
                  {/* Efficient frontier */}
                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Frontera eficiente (Mean-CVaR)</span>
                    </div>
                    <div className="card-body" style={{padding:"8px 4px"}}>
                      <ResponsiveContainer width="100%" height={220}>
                        <ScatterChart margin={{top:8,right:16,bottom:8,left:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="vol" name="Riesgo" unit="%" tick={{fontSize:8,fill:"var(--muted)"}}
                            label={{value:"Volatilidad %",position:"insideBottom",offset:-2,fill:"var(--muted)",fontSize:8}} />
                          <YAxis dataKey="ret" name="Retorno" unit="%" tick={{fontSize:8,fill:"var(--muted)"}} />
                          <Tooltip content={<FrontierTip />} />
                          <Scatter data={result.frontier} fill="var(--teal)">
                            {result.frontier.map((pt, i) => (
                              <Cell key={i} fill={pt.sharpe === Math.max(...result.frontier.map(p=>p.sharpe))
                                ? "var(--yellow)" : "var(--teal)"} />
                            ))}
                          </Scatter>
                          {/* Optimal portfolio dot */}
                          <Scatter
                            data={[{
                              vol: result.metrics.vol,
                              ret: result.metrics.ret,
                              sharpe: result.metrics.sharpe,
                              cvar: result.metrics.cvar,
                            }]}
                            fill="var(--red)"
                            shape="star"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                      <div style={{fontSize:8,color:"var(--muted)",paddingLeft:8,marginTop:4,display:"flex",gap:12}}>
                        <span style={{color:"var(--teal)"}}>● Portafolios frontera</span>
                        <span style={{color:"var(--yellow)"}}>● Max Sharpe</span>
                        <span style={{color:"var(--red)"}}>● Portafolio óptimo</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk contribution chart */}
                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Contribución marginal al riesgo del portafolio</span>
                    </div>
                    <div className="card-body" style={{padding:"8px 4px"}}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={result.riskContrib} layout="vertical" margin={{top:4,right:40,bottom:4,left:4}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis type="number" tick={{fontSize:8,fill:"var(--muted)"}} tickFormatter={v=>`${v}%`} />
                          <YAxis type="category" dataKey="ticker" tick={{fontSize:9,fill:"var(--text2)"}} width={36} />
                          <Tooltip
                            formatter={(v, name) => [`${v}%`, name === "rcPct" ? "Contribución al riesgo" : "Vol marginal"]}
                            contentStyle={{background:"var(--bg3)",border:"1px solid var(--border)",fontSize:10}}
                          />
                          <Bar dataKey="rcPct" name="rcPct" radius={[0,2,2,0]}>
                            {result.riskContrib.map((e, i) => (
                              <Cell key={i} fill={e.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div style={{fontSize:8,color:"var(--muted)",paddingLeft:8,marginTop:4}}>
                        % de contribución de cada activo a la volatilidad total del portafolio (peso × covarianza marginal)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sensitivity table */}
                <div className="card">
                  <div className="card-hdr">
                    <span className="card-title">Análisis de sensibilidad — Aversión al riesgo (λ)</span>
                    <span style={{fontSize:9,color:"var(--muted)"}}>λ activo: {riskAv}</span>
                  </div>
                  <div className="card-body" style={{padding:0}}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>λ</th>
                          <th>Retorno esp.</th>
                          <th>Volatilidad</th>
                          <th>Sharpe</th>
                          <th>CVaR (95%)</th>
                          <th>Max DD</th>
                          <th>N° activos</th>
                          <th>Perfil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.sensitivity.map((row, i) => (
                          <tr key={i} style={row.isActive ? {background:"rgba(0,212,200,0.06)",borderLeft:"2px solid var(--teal)"} : {}}>
                            <td style={{color: row.isActive ? "var(--teal)" : "var(--text2)", fontWeight: row.isActive ? 600 : 400}}>
                              {row.lambda}{row.isActive && " ←"}
                            </td>
                            <td className={row.ret >= 0 ? "pos" : "neg"}>
                              {row.ret > 0 ? "+" : ""}{row.ret}%
                            </td>
                            <td className="neu">{row.vol}%</td>
                            <td className={row.sharpe > 0.5 ? "pos" : row.sharpe > 0 ? "neu" : "neg"}>
                              {row.sharpe.toFixed(3)}
                            </td>
                            <td className="neg">{row.cvar}%</td>
                            <td className="neg">{row.maxDD}%</td>
                            <td style={{color:"var(--text2)"}}>{row.nAssets}</td>
                            <td style={{fontSize:9}}>
                              {row.vol < 10
                                ? <span className="pos">Conservador</span>
                                : row.vol < 16
                                ? <span className="neu">Moderado</span>
                                : <span className="neg">Agresivo</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Methodology note */}
                <div style={{fontSize:9,color:"var(--muted)",lineHeight:1.8,padding:"8px 4px",marginBottom:16}}>
                  <strong style={{color:"var(--text2)"}}>Metodología · </strong>
                  GJR-GARCH(1,1) para volatilidad condicional asimétrica ·
                  HMM 2 estados (Bull/Bear) via clasificación de retornos ·
                  Optimización Mean-CVaR (95%) por búsqueda aleatoria + ajuste de régimen ·
                  Stop-loss = P5 retorno diario histórico del portafolio ·
                  Take-profit = P99 · TC = 0.5025% por operación ·
                  Restricción: peso máximo 40% por activo · rf = 4.3%
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
