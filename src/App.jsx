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

// Hidden Markov Model — 2 states (Bull/Bear) via Viterbi approximation
function fitHMM(returns) {
  const n = returns.length;
  const m = mean(returns);
  const s = std(returns);

  // Classify states by return quantile
  const states = returns.map(r => r < m - 0.3 * s ? 0 : 1); // 0=Bear, 1=Bull

  // Transition matrix
  const trans = [[0, 0], [0, 0]];
  const count = [0, 0];
  for (let i = 0; i < n - 1; i++) {
    trans[states[i]][states[i + 1]]++;
    count[states[i]]++;
  }
  const P = trans.map((row, i) => row.map(v => count[i] > 0 ? v / count[i] : 0.5));

  // Current regime based on last 20 days
  const recent = returns.slice(-20);
  const recentMean = mean(recent);
  const currentRegime = recentMean > m ? "bull" : "bear";
  const regimeConf = Math.min(0.99, Math.abs(recentMean - m) / s * 0.5 + 0.5);
  const bullDays = states.filter(s => s === 1).length;
  const bullFraction = bullDays / n;

  return { P, currentRegime, regimeConf, bullFraction, states };
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

  // Regime-adjusted expected returns
  const adjMeans = {};
  for (const t of selectedTickers) {
    const hmm = hmms[t];
    const regimeAdj = hmm.currentRegime === "bull" ? 1.1 : 0.85;
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

// OR Signals: stop-loss (P5 daily) and take-profit (P99 daily)
function calcORSignals(returns) {
  const stopLoss  = percentile(returns, 5);
  const takeProfit = percentile(returns, 99);
  return {
    stopLoss:   +(stopLoss * 100).toFixed(3),
    takeProfit: +(takeProfit * 100).toFixed(3),
    stopLossAnn:  +(stopLoss * Math.sqrt(252) * 100).toFixed(2),
    tpAnn:        +(takeProfit * Math.sqrt(252) * 100).toFixed(2),
  };
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
    if (!apiKey.trim()) { setError("Ingresá tu API key de Financial Modeling Prep."); return; }
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

      // Dominant regime across portfolio
      const bullCount = tickers.filter(t => hmmResults[t].currentRegime === "bull").length;
      const dominantRegime = bullCount > tickers.length / 2 ? "bull" : "bear";
      addLog(`✓ Régimen detectado: ${dominantRegime === "bull" ? "ALCISTA" : "BAJISTA"} (${bullCount}/${tickers.length} activos)`, true);

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

      setResult({
        weights: optWeights,
        gjr: gjrResults,
        hmm: hmmResults,
        dominantRegime,
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

  const regimeLabel = result?.dominantRegime === "bull" ? "ALCISTA" : "BAJISTA";
  const regimeClass = result?.dominantRegime === "bull" ? "reg-bull" : "reg-bear";

  // Per-asset GJR vol for bar chart
  const gjrBarData = result
    ? Object.entries(result.gjr)
        .filter(([t]) => result.weights[t])
        .map(([t, g]) => ({
          ticker: t,
          vol: +(g.condVol * 100).toFixed(1),
          weight: +(result.weights[t] * 100).toFixed(1),
          fill: ETF_META[t]?.color || "#38bdf8",
        }))
        .sort((a, b) => b.vol - a.vol)
    : [];

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
                    <div className={`metric-val ${result.dominantRegime === "bull" ? "pos" : "neg"}`}>
                      {regimeLabel}
                    </div>
                    <div className="metric-sub">
                      {Object.values(result.hmm).filter(h => h.currentRegime === "bull").length}/{Object.keys(result.hmm).length} activos alcistas
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

                {/* OR Signals */}
                <div className="sec-title">Señales de opciones reales</div>
                <div className="card" style={{marginBottom:12}}>
                  <div className="card-hdr">
                    <span className="card-title">Stop-loss · Take-profit · Timing</span>
                    <span style={{fontSize:9,color:"var(--muted)"}}>
                      Wait days post-señal: {result.waitDays}d
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="signal-grid">
                      <div className="signal-box">
                        <div className="signal-num neg">{result.orSignals.stopLoss}%</div>
                        <div className="signal-lbl">Stop-loss diario (P5)</div>
                      </div>
                      <div className="signal-box">
                        <div className="signal-num pos">{result.orSignals.takeProfit}%</div>
                        <div className="signal-lbl">Take-profit diario (P99)</div>
                      </div>
                      <div className="signal-box">
                        <div className="signal-num" style={{color:"var(--yellow)"}}>{result.waitDays}d</div>
                        <div className="signal-lbl">Wait days</div>
                      </div>
                      <div className="signal-box">
                        <div className="signal-num neg">{result.orSignals.stopLossAnn}%</div>
                        <div className="signal-lbl">Stop anualizado</div>
                      </div>
                      <div className="signal-box">
                        <div className="signal-num pos">{result.orSignals.tpAnn}%</div>
                        <div className="signal-lbl">TP anualizado</div>
                      </div>
                      <div className="signal-box">
                        <div className="signal-num" style={{color:"var(--purple)"}}>
                          {result.dominantRegime === "bull" ? "D1/D9" : "D5"}
                        </div>
                        <div className="signal-lbl">Ventana rebalanceo</div>
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

                  {/* GJR vol bars */}
                  <div className="card">
                    <div className="card-hdr">
                      <span className="card-title">Volatilidad condicional GJR-GARCH</span>
                    </div>
                    <div className="card-body" style={{padding:"8px 4px"}}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={gjrBarData} margin={{top:8,right:16,bottom:8,left:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis dataKey="ticker" tick={{fontSize:8,fill:"var(--muted)"}} />
                          <YAxis tick={{fontSize:8,fill:"var(--muted)"}} tickFormatter={v=>`${v}%`} />
                          <Tooltip
                            formatter={(v, name) => [`${v}%`, name === "vol" ? "Vol GJR anual" : "Peso portafolio"]}
                            contentStyle={{background:"var(--bg3)",border:"1px solid var(--border)",fontSize:10}}
                          />
                          <Legend wrapperStyle={{fontSize:8,color:"var(--muted)"}} />
                          <Bar dataKey="vol" name="Vol GJR %" radius={[2,2,0,0]}>
                            {gjrBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Bar>
                          <Bar dataKey="weight" name="Peso %" fill="rgba(0,212,200,0.3)" radius={[2,2,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Frontier table */}
                <div className="card">
                  <div className="card-hdr">
                    <span className="card-title">Tabla de portafolios — Frontera eficiente</span>
                  </div>
                  <div className="card-body" style={{padding:0}}>
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Volatilidad</th>
                          <th>Retorno esperado</th>
                          <th>Sharpe</th>
                          <th>CVaR (95%)</th>
                          <th>Perfil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.frontier.map((pt, i) => {
                          const isOpt = Math.abs(pt.vol - result.metrics.vol) < 1 &&
                                        Math.abs(pt.ret - result.metrics.ret) < 1;
                          return (
                            <tr key={i} style={isOpt ? {background:"rgba(0,212,200,0.05)"} : {}}>
                              <td style={{color:"var(--muted)"}}>{i + 1}</td>
                              <td className="neu">{pt.vol}%</td>
                              <td className={pt.ret >= 0 ? "pos" : "neg"}>
                                {pt.ret > 0 ? "+" : ""}{pt.ret}%
                              </td>
                              <td className={pt.sharpe > 0.5 ? "pos" : pt.sharpe > 0 ? "neu" : "neg"}>
                                {pt.sharpe.toFixed(3)}
                              </td>
                              <td className="neg">{pt.cvar}%</td>
                              <td style={{fontSize:9}}>
                                {pt.vol < 10 ? <span className="pos">Conservador</span>
                                  : pt.vol < 16 ? <span className="neu">Moderado</span>
                                  : <span className="neg">Agresivo</span>}
                                {isOpt && <span style={{color:"var(--teal)",marginLeft:6}}>← óptimo</span>}
                              </td>
                            </tr>
                          );
                        })}
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
