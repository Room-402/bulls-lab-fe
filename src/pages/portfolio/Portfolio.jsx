import { useState, useEffect, useMemo } from "react"
import { NavLink, Outlet, useOutletContext } from "react-router-dom"
import { portfolioService } from "../../services/portfolioService"
import { getStockDetailsBatch } from "../../services/marketService"

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmt = (n) => Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })
const fmtN = (n) => (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })
const pos = (n) => n >= 0

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
.h-table th:first-child, .h-table th:nth-child(2) { text-align: left; }
.h-table td {
  padding: 0.8rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  color: #111827;
  text-align: right;
}
.h-table td:first-child, .h-table td:nth-child(2) { text-align: left; }
.h-table tr:last-child td { border-bottom: none; }
.h-table tr:hover td { background: #f9fafb; cursor: pointer; }
.stock-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.78rem; color: #111827; }
.stock-company { font-size: 0.65rem; color: #6b7280; margin-top: 2px; }
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

.loading { padding: 2rem; text-align: center; color: #6b7280; font-size: 0.8rem; }
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

/* ─── DATA HOOK ──────────────────────────────────────────────────────────── */
function usePortfolioData() {
  const [holdings, setHoldings] = useState([])
  const [marketData, setMarketData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const holds = await portfolioService.getHoldings()
        setHoldings(holds || [])

        if (holds && holds.length > 0) {
          const tickers = holds.map(h => h.stock_ticker)
          const mData = await getStockDetailsBatch(tickers)
          setMarketData(mData)
        }
      } catch (err) {
        console.error("Failed to load portfolio", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const data = useMemo(() => {
    let invested = 0
    let current = 0
    const sectorMap = {}

    const enrichedHoldings = holdings.map(h => {
      const details = marketData[h.stock_ticker] || {}
      const ltp = details.price || h.avg_buy_price || 0
      const company = details.company_name || ""
      const dayHigh = details.day_high || 0
      const dayLow = details.day_low || 0
      const peRatio = details.pe_ratio || "-"
      const sector = details.other_details?.sector || details.other_details?.industry || "Others"

      const inv = h.avg_buy_price * h.total_quantity
      const cur = ltp * h.total_quantity
      const gl = cur - inv
      const glPct = inv > 0 ? (gl / inv) * 100 : 0

      invested += inv
      current += cur

      if (!sectorMap[sector]) {
        sectorMap[sector] = { invested: 0, current: 0 }
      }
      sectorMap[sector].invested += inv
      sectorMap[sector].current += cur

      return {
        name: h.stock_ticker,
        company,
        sector,
        qty: h.total_quantity,
        avg: h.avg_buy_price,
        ltp,
        dayHigh,
        dayLow,
        peRatio,
        inv,
        cur,
        gl,
        glPct,
      }
    })

    const overallLoss = current - invested
    const overallLossPct = invested > 0 ? (overallLoss / invested) * 100 : 0

    const COLORS = ["#6366f1", "#059669", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e", "#9ca3af"]
    let colorIndex = 0
    const computedSectors = Object.keys(sectorMap).map(sec => {
      const s = sectorMap[sec]
      const pct = current > 0 ? (s.current / current) * 100 : 0
      const ret = s.invested > 0 ? ((s.current - s.invested) / s.invested) * 100 : 0
      const color = COLORS[colorIndex % COLORS.length]
      colorIndex++
      return { name: sec, pct: Number(pct.toFixed(1)), ret: Number(ret.toFixed(2)), color }
    }).sort((a, b) => b.pct - a.pct)

    return {
      holdings: enrichedHoldings,
      sectors: computedSectors,
      invested,
      current,
      overallLoss,
      overallLossPct,
      loading
    }
  }, [holdings, marketData, loading])

  return data
}

/* ─── OVERVIEW ───────────────────────────────────────────────────────────── */
function PortfolioOverview() {
  const { invested, current, overallLoss, overallLossPct, loading } = useOutletContext()

  if (loading) return <div className="loading">Loading portfolio...</div>

  // Mocking breakup to keep UI rich even if we only have equity right now
  const breakup = [
    { label: "Equity", pct: 100, color: "#059669" },
    { label: "Mutual Funds", pct: 0, color: "#3b82f6" },
  ]
  const assets = [
    { type: "Equity", pct: 100, invested, current, gl: overallLoss, glPct: overallLossPct, dayGl: 0, dayGlPct: 0 },
    { type: "Mutual Funds", pct: 0, invested: 0, current: 0, gl: 0, glPct: 0, dayGl: 0, dayGlPct: 0 },
  ]

  return (
    <div className="pf-wrap">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Invested Amount</div>
          <div className="stat-value">₹{fmtN(invested)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Value</div>
          <div className="stat-value">₹{fmtN(current)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall {pos(overallLoss) ? "Gain" : "Loss"}</div>
          <div className={`stat-value ${pos(overallLoss) ? "green" : "red"}`}>
            {pos(overallLoss) ? "+" : "-"}₹{fmt(overallLoss)}
          </div>
          <div className={`stat-sub ${pos(overallLoss) ? "green" : "red"}`}>
            {pos(overallLossPct) ? "+" : ""}{fmtN(overallLossPct)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Gain</div>
          <div className="stat-value muted">₹{fmtN(0)}</div>
          <div className="stat-sub muted">0.00%</div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Portfolio Breakup</div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="breakup-row">
            <div className="donut-wrap">
              <Donut segments={breakup} />
              <div className="donut-label">
                <strong>{breakup[0].pct}%</strong>
                <span>Equity</span>
              </div>
            </div>
            <div className="legend-list">
              {breakup.map(b => (
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
              {assets.map(a => (
                <tr key={a.type}>
                  <td className="type-cell">
                    {a.type}
                    <span style={{ color: "#9ca3af", fontSize: "0.7rem", marginLeft: "0.4rem" }}>({a.pct}%)</span>
                  </td>
                  <td>₹{fmtN(a.invested)}</td>
                  <td>₹{fmtN(a.current)}</td>
                  <td>
                    <div className={pos(a.gl) ? "green" : "red"}>{pos(a.gl) ? "+" : "-"}₹{fmt(a.gl)}</div>
                    <div className={`stat-sub ${pos(a.gl) ? "green" : "red"}`}>{pos(a.glPct) ? "+" : ""}{fmtN(a.glPct)}%</div>
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
  const { holdings, sectors, invested, current, overallLoss, overallLossPct, loading } = useOutletContext()

  if (loading) return <div className="loading">Loading portfolio...</div>

  // Generate top drivers
  const sortedByGl = [...holdings].sort((a, b) => b.glPct - a.glPct)
  const topGainers = sortedByGl.slice(0, 5)
  const topLosers = [...sortedByGl].reverse().slice(0, 5)

  const driversList = driversTab === "gainers" ? topGainers : topLosers

  return (
    <div className="pf-wrap">
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">Invested Amount</div>
          <div className="stat-value">₹{fmtN(invested)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Current Value</div>
          <div className="stat-value">₹{fmtN(current)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall {pos(overallLoss) ? "Gain" : "Loss"}</div>
          <div className={`stat-value ${pos(overallLoss) ? "green" : "red"}`}>
            {pos(overallLoss) ? "+" : "-"}₹{fmt(overallLoss)}
          </div>
          <div className={`stat-sub ${pos(overallLoss) ? "green" : "red"}`}>{pos(overallLossPct) ? "+" : ""}{fmtN(overallLossPct)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's Gain</div>
          <div className="stat-value muted">₹{fmtN(0)}</div>
          <div className="stat-sub muted">0.00%</div>
        </div>
      </div>

      <div className="section">
        <div className="holdings-header">
          <div className="holdings-count">Holdings &nbsp;<strong>{holdings.length}</strong></div>
          <button className="btn-exit">Select &amp; Exit</button>
        </div>
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="h-table" style={{ minWidth: "900px" }}>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Avg. Price</th>
                <th>LTP</th>
                <th>Day H/L</th>
                <th>P/E Ratio</th>
                <th>Inv. Amt.</th>
                <th>Current Val.</th>
                <th>Overall G/L</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => (
                <tr key={h.name}>
                  <td><div className="stock-name">{h.name}</div></td>
                  <td><div className="stock-company">{h.company || "-"}</div></td>
                  <td>{h.qty}</td>
                  <td>₹{fmtN(h.avg)}</td>
                  <td>₹{fmtN(h.ltp)}</td>
                  <td>
                    <div className="muted" style={{ fontSize: "0.65rem" }}>
                      H: ₹{fmtN(h.dayHigh)}<br />L: ₹{fmtN(h.dayLow)}
                    </div>
                  </td>
                  <td><span className="muted">{h.peRatio !== "-" ? fmtN(h.peRatio) : "-"}</span></td>
                  <td>₹{fmtN(h.inv)}</td>
                  <td>₹{fmtN(h.cur)}</td>
                  <td>
                    <div className="gl-cell">
                      <span className={pos(h.gl) ? "green" : "red"}>{pos(h.gl) ? "+" : "-"}₹{fmt(h.gl)}</span>
                      <span className={`stat-sub ${pos(h.gl) ? "green" : "red"}`}>{pos(h.glPct) ? "+" : ""}{fmtN(h.glPct)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {holdings.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>No holdings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="tpin-notice">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Start selling your stocks without TPIN
      </div>

      <div className="section">
        <div className="section-title">Portfolio Allocation</div>
        <div className="card" style={{ padding: "1.25rem" }}>
          <div className="sector-bar-wrap">
            {sectors.map(s => (
              <div key={s.name} className="sector-seg" style={{ flex: s.pct, background: s.color }} title={`${s.name}: ${s.pct}%`} />
            ))}
          </div>
          <div className="sector-list">
            {sectors.map(s => (
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
              {sectors.map(r => (
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
              <button className={`dtab ${driversTab === "losers" ? "active" : ""}`} onClick={() => setDriversTab("losers")}>Top Losers</button>
            </div>
            <table className="d-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th style={{ textAlign: "right" }}>Day High</th>
                  <th style={{ textAlign: "right" }}>LTP</th>
                  <th style={{ textAlign: "right" }}>Overall Gain</th>
                </tr>
              </thead>
              <tbody>
                {driversList.map(s => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td><span className="muted">₹{fmtN(s.dayHigh)}</span></td>
                    <td>₹{fmtN(s.ltp)}</td>
                    <td className={pos(s.glPct) ? "green" : "red"}>{pos(s.glPct) ? "+" : ""}{fmtN(s.glPct)}%</td>
                  </tr>
                ))}
                {driversList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="muted" style={{ textAlign: "center" }}>No data available</td>
                  </tr>
                )}
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
  const data = usePortfolioData()

  return (
    <>
      <style>{CSS}</style>
      <div className="pf-subnav">
        <NavLink to="/portfolio/overview" className={({ isActive }) => `pf-tab${isActive ? " active" : ""}`}>Overview</NavLink>
        <NavLink to="/portfolio/equity" className={({ isActive }) => `pf-tab${isActive ? " active" : ""}`}>Equity</NavLink>
      </div>
      <Outlet context={data} />
    </>
  )
}

export { PortfolioOverview, PortfolioEquity }