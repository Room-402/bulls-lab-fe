import { useState } from "react"
import { NavLink, Outlet, Navigate } from "react-router-dom"

/* ─── DUMMY DATA ─────────────────────────────────────────────────────────── */
const OVERVIEW = {
  invested: 76419, current: 73659, overallLoss: -2760.73, overallLossPct: -3.61,
  todayGain: 0, todayGainPct: 0,
  breakup: [
    { label: "Equity",       pct: 82, color: "#059669" },
    { label: "Mutual Funds", pct: 18, color: "#3b82f6" },
  ],
  assets: [
    { type: "Equity",       pct: 82, invested: 62999, current: 60180, gl: -2819.86, glPct: -4.48, dayGl: 0, dayGlPct: 0 },
    { type: "Mutual Funds", pct: 18, invested: 13420, current: 13479, gl: 59.12,    glPct: 0.44,  dayGl: 0, dayGlPct: 0 },
  ],
}

const HOLDINGS = [
  { name: "TATAPOWER",  qty: 10, avg: 388.01, ltp: 378.00, inv: 3880,  cur: 3780,  gl: -100.14,  glPct: -2.58,  dayGl: 0, dayGlPct: 0 },
  { name: "SONACOMS",   qty: 25, avg: 521.25, ltp: 532.10, inv: 13031, cur: 13303, gl: 271.32,   glPct: 2.08,   dayGl: 0, dayGlPct: 0 },
  { name: "PRAJIND",    qty: 35, avg: 417.30, ltp: 311.45, inv: 14605, cur: 10901, gl: -3704.72, glPct: -25.37, dayGl: 0, dayGlPct: 0 },
  { name: "NIFTYIETF",  qty: 10, avg: 289.57, ltp: 287.97, inv: 2895,  cur: 2880,  gl: -16.02,   glPct: -0.55,  dayGl: 0, dayGlPct: 0 },
  { name: "NEWGEN",     qty: 29, avg: 648.12, ltp: 556.90, inv: 18795, cur: 16150, gl: -2645.35, glPct: -14.07, dayGl: 0, dayGlPct: 0 },
  { name: "FEDERALBNK", qty: 45, avg: 217.60, ltp: 292.60, inv: 9791,  cur: 13167, gl: 3375.05,  glPct: 34.47,  dayGl: 0, dayGlPct: 0 },
]

const EQUITY_STATS = { invested: 62999, current: 60180, gl: -2819.86, glPct: -4.48, todayGain: 0, todayGainPct: 0 }

const SECTORS = [
  { name: "IT - Software",                       pct: 26.8, color: "#6366f1" },
  { name: "Castings/Forgings",                   pct: 22.1, color: "#059669" },
  { name: "Bank - Private",                      pct: 21.9, color: "#3b82f6" },
  { name: "Engineering - Industrial Equipments", pct: 18.1, color: "#f59e0b" },
  { name: "Power Generation/Distribution",       pct: 6.3,  color: "#ec4899" },
  { name: "Others",                              pct: 4.8,  color: "#9ca3af" },
]

const SECTOR_RETURNS = [
  { name: "Bank - Private",                      ret: 34.47  },
  { name: "Castings/Forgings",                   ret: 2.08   },
  { name: "Power Generation/Distribution",       ret: -2.58  },
  { name: "IT - Software",                       ret: -14.07 },
  { name: "Engineering - Industrial Equipments", ret: -25.37 },
  { name: "Others",                              ret: -0.55  },
]

const TOP_LOSERS = [
  { name: "TATAPOWER",  wkHigh: 416.80, ltp: 378.00, dayGain: 0 },
  { name: "FEDERALBNK", wkHigh: 298.25, ltp: 292.60, dayGain: 0 },
  { name: "SONACOMS",   wkHigh: 559.50, ltp: 532.10, dayGain: 0 },
  { name: "NIFTYIETF",  wkHigh: 328.24, ltp: 287.97, dayGain: 0 },
]

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmt  = (n) => Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })
const fmtN = (n) => n.toLocaleString("en-IN",           { maximumFractionDigits: 2 })
const pos  = (n) => n >= 0

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;600;700&display=swap');

.pf-wrap {
  background: #f9fafb;
  min-height: calc(100vh - 98px);
  font-family: 'Syne', sans-serif;
  color: #111827;
  padding-bottom: 3rem;
}

/* Sub nav */
.pf-subnav {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 0;
  padding: 0 2rem;
  position: sticky;
  top: 56px;
  z-index: 80;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.pf-tab {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-decoration: none;
  padding: 0.75rem 1.1rem;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.pf-tab:hover { color: #111827; }
.pf-tab.active { color: #059669; border-bottom-color: #059669; }

/* Stat row */
.stat-row {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem 0;
  flex-wrap: wrap;
}
.stat-card {
  flex: 1;
  min-width: 160px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.stat-label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}
.stat-value {
  font-family: 'DM Mono', monospace;
  font-size: 1.3rem;
  font-weight: 500;
  color: #111827;
  line-height: 1;
}
.stat-sub {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  margin-top: 0.3rem;
}
.green  { color: #059669; }
.red    { color: #dc2626; }
.muted  { color: #9ca3af; }

/* Section */
.section { margin: 1.5rem 2rem 0; }
.section-title {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

/* Card */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

/* Donut */
.breakup-row { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: center; }
.donut-wrap  { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
.donut-wrap svg { transform: rotate(-90deg); }
.donut-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  color: #9ca3af;
}
.donut-label strong { font-size: 1rem; color: #111827; }
.legend-list { display: flex; flex-direction: column; gap: 0.5rem; }
.legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; }
.legend-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Asset table */
.asset-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.asset-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  background: #f9fafb;
}
.asset-table td {
  padding: 0.85rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  color: #111827;
}
.asset-table tr:last-child td { border-bottom: none; }
.asset-table tr:hover td { background: #f9fafb; }
.type-cell { font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.8rem; }

/* Holdings */
.holdings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.holdings-count { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; }
.holdings-count strong { color: #059669; font-size: 0.9rem; }
.btn-exit {
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-exit:hover { background: #fee2e2; }

.h-table { width: 100%; border-collapse: collapse; }
.h-table th {
  text-align: right;
  padding: 0.55rem 0.75rem;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  background: #f9fafb;
}
.h-table th:first-child { text-align: left; }
.h-table td {
  padding: 0.8rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  color: #111827;
  text-align: right;
}
.h-table td:first-child { text-align: left; }
.h-table tr:last-child td { border-bottom: none; }
.h-table tr:hover td { background: #f9fafb; cursor: pointer; }
.stock-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; color: #111827; }
.gl-cell { display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem; }

/* Sector bar */
.sector-bar-wrap {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  gap: 2px;
}
.sector-seg { border-radius: 2px; transition: opacity 0.2s; }
.sector-seg:hover { opacity: 0.7; }
.sector-list { display: flex; flex-direction: column; gap: 0.6rem; }
.sector-row  { display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; }
.sector-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sector-name { flex: 1; color: #374151; }
.sector-pct  { font-family: 'DM Mono', monospace; font-size: 0.72rem; color: #6b7280; }

/* Returns bar */
.ret-bar-bg   { flex: 1; height: 4px; background: #f3f4f6; border-radius: 2px; overflow: hidden; }
.ret-bar-fill { height: 100%; border-radius: 2px; }

/* Drivers */
.drivers-tabs { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
.dtab {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0.3rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: transparent;
  color: #6b7280;
  transition: all 0.15s;
  font-family: 'Syne', sans-serif;
}
.dtab.active { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }

.d-table { width: 100%; border-collapse: collapse; }
.d-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 600;
  background: #f9fafb;
}
.d-table th:not(:first-child) { text-align: right; }
.d-table td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  color: #111827;
  text-align: right;
}
.d-table td:first-child { text-align: left; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.76rem; }
.d-table tr:last-child td { border-bottom: none; }

/* TPIN */
.tpin-notice {
  margin: 1rem 2rem 0;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.73rem;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Two col */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
`

/* ─── DONUT ──────────────────────────────────────────────────────────────── */
function Donut({ segments }) {
  const r = 45, cx = 60, cy = 60, circumference = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circumference
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset} strokeLinecap="butt" />
        )
        offset += dash
        return el
      })}
    </svg>
  )
}

/* ─── OVERVIEW ───────────────────────────────────────────────────────────── */
function PortfolioOverview() {
  const o = OVERVIEW
  return (
    <div className="pf-wrap">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Invested Amount</div>
          <div className="stat-value">₹{fmtN(o.invested)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Value</div>
          <div className="stat-value">₹{fmtN(o.current)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall {pos(o.overallLoss) ? "Gain" : "Loss"}</div>
          <div className={`stat-value ${pos(o.overallLoss) ? "green" : "red"}`}>
            {pos(o.overallLoss) ? "+" : "-"}₹{fmt(o.overallLoss)}
          </div>
          <div className={`stat-sub ${pos(o.overallLoss) ? "green" : "red"}`}>
            {pos(o.overallLossPct) ? "+" : ""}{o.overallLossPct}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Gain</div>
          <div className="stat-value muted">₹{fmtN(o.todayGain)}</div>
          <div className="stat-sub muted">{o.todayGainPct}%</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Portfolio Breakup</div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="breakup-row">
            <div className="donut-wrap">
              <Donut segments={o.breakup} />
              <div className="donut-label">
                <strong>{o.breakup[0].pct}%</strong>
                <span>Equity</span>
              </div>
            </div>
            <div className="legend-list">
              {o.breakup.map(b => (
                <div key={b.label} className="legend-item">
                  <div className="legend-dot" style={{ background: b.color }} />
                  <span style={{ color: "#374151" }}>{b.label}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", color: b.color, marginLeft: "auto", paddingLeft: "1rem" }}>
                    {b.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="card">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Asset Type</th><th>Invested Amt</th><th>Current Value</th><th>Overall G/L</th><th>Day's G/L</th>
              </tr>
            </thead>
            <tbody>
              {o.assets.map(a => (
                <tr key={a.type}>
                  <td className="type-cell">
                    {a.type}
                    <span style={{ color: "#9ca3af", fontSize: "0.7rem", marginLeft: "0.4rem" }}>({a.pct}%)</span>
                  </td>
                  <td>₹{fmtN(a.invested)}</td>
                  <td>₹{fmtN(a.current)}</td>
                  <td>
                    <div className={pos(a.gl) ? "green" : "red"}>{pos(a.gl) ? "+" : "-"}₹{fmt(a.gl)}</div>
                    <div className={`stat-sub ${pos(a.gl) ? "green" : "red"}`}>{pos(a.glPct) ? "+" : ""}{a.glPct}%</div>
                  </td>
                  <td>
                    <div className="muted">₹{fmtN(a.dayGl)}</div>
                    <div className="stat-sub muted">{a.dayGlPct}%</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── EQUITY ─────────────────────────────────────────────────────────────── */
function PortfolioEquity() {
  const [driversTab, setDriversTab] = useState("losers")
  const s = EQUITY_STATS
  return (
    <div className="pf-wrap">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Invested Amount</div>
          <div className="stat-value">₹{fmtN(s.invested)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Value</div>
          <div className="stat-value">₹{fmtN(s.current)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall {pos(s.gl) ? "Gain" : "Loss"}</div>
          <div className={`stat-value ${pos(s.gl) ? "green" : "red"}`}>
            {pos(s.gl) ? "+" : "-"}₹{fmt(s.gl)}
          </div>
          <div className={`stat-sub ${pos(s.gl) ? "green" : "red"}`}>{pos(s.glPct) ? "+" : ""}{s.glPct}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Gain</div>
          <div className="stat-value muted">₹{fmtN(s.todayGain)}</div>
          <div className="stat-sub muted">{s.todayGainPct}%</div>
        </div>
      </div>

      <div className="section">
        <div className="holdings-header">
          <div className="holdings-count">Holdings &nbsp;<strong>{HOLDINGS.length}</strong></div>
          <button className="btn-exit">Select &amp; Exit</button>
        </div>
        <div className="card">
          <table className="h-table">
            <thead>
              <tr>
                <th>Name</th><th>Qty</th><th>Avg. Price</th><th>LTP</th>
                <th>Inv. Amt.</th><th>Current Val.</th><th>Overall G/L</th><th>Day's G/L</th>
              </tr>
            </thead>
            <tbody>
              {HOLDINGS.map(h => (
                <tr key={h.name}>
                  <td><div className="stock-name">{h.name}</div></td>
                  <td>{h.qty}</td>
                  <td>₹{fmtN(h.avg)}</td>
                  <td>₹{fmtN(h.ltp)}</td>
                  <td>₹{fmtN(h.inv)}</td>
                  <td>₹{fmtN(h.cur)}</td>
                  <td>
                    <div className="gl-cell">
                      <span className={pos(h.gl) ? "green" : "red"}>{pos(h.gl) ? "+" : "-"}₹{fmt(h.gl)}</span>
                      <span className={`stat-sub ${pos(h.gl) ? "green" : "red"}`}>{pos(h.glPct) ? "+" : ""}{h.glPct}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="gl-cell">
                      <span className="muted">₹{fmtN(h.dayGl)}</span>
                      <span className="stat-sub muted">{h.dayGlPct}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="tpin-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Start selling your stocks without TPIN
      </div>

      <div className="section">
        <div className="section-title">Portfolio Allocation</div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="sector-bar-wrap">
            {SECTORS.map(s => (
              <div key={s.name} className="sector-seg" style={{ flex: s.pct, background: s.color }} title={`${s.name}: ${s.pct}%`} />
            ))}
          </div>
          <div className="sector-list">
            {SECTORS.map(s => (
              <div key={s.name} className="sector-row">
                <div className="sector-dot" style={{ background: s.color }} />
                <span className="sector-name">{s.name}</span>
                <span className="sector-pct">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section two-col">
        <div>
          <div className="section-title">All Sector Returns</div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: "1rem" }}>Which sectors are giving you the best returns</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SECTOR_RETURNS.map(r => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "#374151", width: "180px", flexShrink: 0 }}>{r.name}</span>
                  <div className="ret-bar-bg">
                    <div className="ret-bar-fill" style={{ width: `${Math.min(Math.abs(r.ret), 100)}%`, background: r.ret >= 0 ? "#059669" : "#dc2626" }} />
                  </div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", width: "52px", textAlign: "right" }}
                        className={r.ret >= 0 ? "green" : "red"}>
                    {r.ret > 0 ? "+" : ""}{r.ret}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="section-title">Top Drivers</div>
          <div className="card" style={{ padding: "1.25rem" }}>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: "0.75rem" }}>Which stocks are giving you the best and worst returns</p>
            <div className="drivers-tabs">
              <button className={`dtab ${driversTab === "gainers" ? "active" : ""}`} onClick={() => setDriversTab("gainers")}>Top Gainers</button>
              <button className={`dtab ${driversTab === "losers"  ? "active" : ""}`} onClick={() => setDriversTab("losers")}>Top Losers</button>
            </div>
            <table className="d-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th style={{textAlign:"right"}}>52 W/H</th>
                  <th style={{textAlign:"right"}}>LTP</th>
                  <th style={{textAlign:"right"}}>Day's Gain</th>
                </tr>
              </thead>
              <tbody>
                {TOP_LOSERS.map(s => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td>₹{fmtN(s.wkHigh)}</td>
                    <td>₹{fmtN(s.ltp)}</td>
                    <td className="muted">{s.dayGain}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── LAYOUT ─────────────────────────────────────────────────────────────── */
export default function Portfolio() {
  return (
    <>
      <style>{CSS}</style>
      <div className="pf-subnav">
        <NavLink to="/portfolio/overview" className={({ isActive }) => `pf-tab${isActive ? " active" : ""}`}>Overview</NavLink>
        <NavLink to="/portfolio/equity"   className={({ isActive }) => `pf-tab${isActive ? " active" : ""}`}>Equity</NavLink>
      </div>
      <Outlet />
    </>
  )
}

export { PortfolioOverview, PortfolioEquity }