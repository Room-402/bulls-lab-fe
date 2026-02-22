import { useState } from "react"

/* ─── DUMMY DATA ─────────────────────────────────────────────────────────── */
const WATCHLIST = [
  {
    symbol: "FEDERALBNK", exchange: "NSE", name: "Federal Bank Ltd",
    ltp: 292.60, change: 4.30, changePct: 1.49, positive: true,
    open: 289.55, high: 293.20, low: 287.05, close: 288.30,
    avgPrice: 291.93, volume: "50,30,819", oi: "17,63,40,000",
    bid: 0.00, ask: 292.60,
    lowerCircuit: 263.35, upperCircuit: 321.85,
    weekLow: 172.66, weekHigh: 298.25,
    analyst: { target: 267.81, expectedPct: -8.47, buy: 76, hold: 23, sell: 0, count: 13 },
    fundamentals: { pe: 18.52, pb: 2.05, peg: 0, roe: "11.09%", roa: "1.09%" },
    performance: {
      sectorRank: 9, cap: "MID CAP", sector: "BANK - PRIVATE",
      shortTerm: "mildly positive", longTerm: "neutral",
      marketCap: "₹71,773 Cr", oneYearReturn: "58.69%",
      sectorReturn: "14.49%", marketReturn: "11.6%",
      quality: { label: "GOOD", score: 4 },
      valuation: { label: "EXPENSIVE", score: 2 },
      financial: { label: "EXPENSIVE", score: 2 },
    },
    shareholding: { dec: [{ label: "Promoter", pct: 34.5 }, { label: "FII", pct: 28.2 }, { label: "DII", pct: 18.6 }, { label: "Public", pct: 18.7 }] },
  },
  {
    symbol: "TATAPOWER", exchange: "NSE", name: "Tata Power Company Ltd",
    ltp: 378.00, change: -10.14, changePct: -2.61, positive: false,
    open: 385.00, high: 388.50, low: 375.20, close: 388.01,
    avgPrice: 381.50, volume: "32,15,600", oi: "8,20,10,000",
    bid: 377.85, ask: 378.10,
    lowerCircuit: 340.50, upperCircuit: 416.80,
    weekLow: 268.00, weekHigh: 416.80,
    analyst: { target: 410.00, expectedPct: 8.47, buy: 62, hold: 28, sell: 10, count: 10 },
    fundamentals: { pe: 32.10, pb: 4.20, peg: 1.2, roe: "9.80%", roa: "2.10%" },
    performance: {
      sectorRank: 3, cap: "LARGE CAP", sector: "POWER GENERATION",
      shortTerm: "neutral", longTerm: "mildly positive",
      marketCap: "₹1,20,902 Cr", oneYearReturn: "-9.28%",
      sectorReturn: "6.14%", marketReturn: "11.6%",
      quality: { label: "GOOD", score: 4 }, valuation: { label: "FAIR", score: 3 }, financial: { label: "GOOD", score: 4 },
    },
    shareholding: { dec: [{ label: "Promoter", pct: 46.9 }, { label: "FII", pct: 14.8 }, { label: "DII", pct: 22.1 }, { label: "Public", pct: 16.2 }] },
  },
  {
    symbol: "SONACOMS", exchange: "NSE", name: "Sona BLW Precision Forgings",
    ltp: 532.10, change: 10.85, changePct: 2.08, positive: true,
    open: 522.00, high: 535.00, low: 519.00, close: 521.25,
    avgPrice: 527.30, volume: "12,44,210", oi: "3,10,50,000",
    bid: 532.00, ask: 532.25,
    lowerCircuit: 477.15, upperCircuit: 583.85,
    weekLow: 410.00, weekHigh: 559.50,
    analyst: { target: 580.00, expectedPct: 9.00, buy: 70, hold: 20, sell: 10, count: 8 },
    fundamentals: { pe: 58.40, pb: 10.30, peg: 2.1, roe: "18.20%", roa: "9.50%" },
    performance: {
      sectorRank: 2, cap: "MID CAP", sector: "CASTINGS/FORGINGS",
      shortTerm: "positive", longTerm: "positive",
      marketCap: "₹31,540 Cr", oneYearReturn: "2.08%",
      sectorReturn: "8.22%", marketReturn: "11.6%",
      quality: { label: "EXCELLENT", score: 5 }, valuation: { label: "EXPENSIVE", score: 2 }, financial: { label: "GOOD", score: 4 },
    },
    shareholding: { dec: [{ label: "Promoter", pct: 33.1 }, { label: "FII", pct: 35.4 }, { label: "DII", pct: 12.8 }, { label: "Public", pct: 18.7 }] },
  },
  {
    symbol: "NEWGEN", exchange: "NSE", name: "Newgen Software Technologies",
    ltp: 556.90, change: -7.22, changePct: -1.28, positive: false,
    open: 562.00, high: 565.80, low: 554.10, close: 564.12,
    avgPrice: 559.45, volume: "4,82,340", oi: "1,20,00,000",
    bid: 556.70, ask: 557.00,
    lowerCircuit: 507.55, upperCircuit: 620.45,
    weekLow: 420.00, weekHigh: 710.00,
    analyst: { target: 650.00, expectedPct: 16.71, buy: 80, hold: 20, sell: 0, count: 6 },
    fundamentals: { pe: 44.20, pb: 9.80, peg: 1.5, roe: "23.10%", roa: "15.20%" },
    performance: {
      sectorRank: 5, cap: "MID CAP", sector: "IT - SOFTWARE",
      shortTerm: "negative", longTerm: "neutral",
      marketCap: "₹16,102 Cr", oneYearReturn: "-14.07%",
      sectorReturn: "-3.80%", marketReturn: "11.6%",
      quality: { label: "EXCELLENT", score: 5 }, valuation: { label: "EXPENSIVE", score: 2 }, financial: { label: "EXCELLENT", score: 5 },
    },
    shareholding: { dec: [{ label: "Promoter", pct: 55.2 }, { label: "FII", pct: 8.4 }, { label: "DII", pct: 16.1 }, { label: "Public", pct: 20.3 }] },
  },
  {
    symbol: "PRAJIND", exchange: "NSE", name: "Praj Industries Ltd",
    ltp: 311.45, change: -5.85, changePct: -1.84, positive: false,
    open: 318.00, high: 319.50, low: 310.00, close: 317.30,
    avgPrice: 314.75, volume: "8,20,550", oi: "2,45,00,000",
    bid: 311.30, ask: 311.60,
    lowerCircuit: 285.60, upperCircuit: 349.40,
    weekLow: 285.00, weekHigh: 598.00,
    analyst: { target: 400.00, expectedPct: 28.44, buy: 85, hold: 15, sell: 0, count: 7 },
    fundamentals: { pe: 22.80, pb: 5.60, peg: 0.9, roe: "24.50%", roa: "14.80%" },
    performance: {
      sectorRank: 3, cap: "MID CAP", sector: "ENGINEERING",
      shortTerm: "negative", longTerm: "neutral",
      marketCap: "₹5,768 Cr", oneYearReturn: "-25.37%",
      sectorReturn: "-10.22%", marketReturn: "11.6%",
      quality: { label: "GOOD", score: 4 }, valuation: { label: "FAIR", score: 3 }, financial: { label: "GOOD", score: 4 },
    },
    shareholding: { dec: [{ label: "Promoter", pct: 29.8 }, { label: "FII", pct: 22.1 }, { label: "DII", pct: 28.4 }, { label: "Public", pct: 19.7 }] },
  },
  {
    symbol: "NIFTYIETF", exchange: "NSE", name: "Nippon India Nifty IT ETF",
    ltp: 287.97, change: -1.60, changePct: -0.55, positive: false,
    open: 290.00, high: 291.50, low: 286.80, close: 289.57,
    avgPrice: 289.15, volume: "1,10,200", oi: "—",
    bid: 287.85, ask: 288.10,
    lowerCircuit: 259.20, upperCircuit: 317.00,
    weekLow: 220.00, weekHigh: 328.24,
    analyst: { target: 310.00, expectedPct: 7.65, buy: 60, hold: 30, sell: 10, count: 4 },
    fundamentals: { pe: 28.10, pb: 6.40, peg: 0, roe: "—", roa: "—" },
    performance: {
      sectorRank: 1, cap: "LARGE CAP", sector: "IT - ETF",
      shortTerm: "neutral", longTerm: "neutral",
      marketCap: "₹1,245 Cr", oneYearReturn: "-0.55%",
      sectorReturn: "-3.80%", marketReturn: "11.6%",
      quality: { label: "N/A", score: 0 }, valuation: { label: "FAIR", score: 3 }, financial: { label: "N/A", score: 0 },
    },
    shareholding: { dec: [{ label: "Promoter", pct: 0 }, { label: "FII", pct: 5.2 }, { label: "DII", pct: 82.4 }, { label: "Public", pct: 12.4 }] },
  },
]

const OVERVIEW_TABS = ["Activity", "Analyst Ratings & Fundamental Ratios", "Performance Overview", "Shareholding Patterns", "Price Summary", "News", "Events", "Trend Analyser", "Highest Build Up Strikes", "Similar Stocks"]

const SHAREHOLDING_COLORS = ["#059669", "#3b82f6", "#f59e0b", "#6366f1"]

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmtN = (n) => typeof n === "number" ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : n
const pos  = (n) => n >= 0

function ScoreDots({ score, max = 5 }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%",
          background: i < score ? "#059669" : "#e5e7eb"
        }} />
      ))}
    </div>
  )
}

function AnalystBar({ buy, hold, sell }) {
  return (
    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, margin: "0.5rem 0" }}>
      <div style={{ flex: buy,  background: "#059669", borderRadius: 4 }} title={`Buy ${buy}%`} />
      <div style={{ flex: hold, background: "#f59e0b", borderRadius: 4 }} title={`Hold ${hold}%`} />
      <div style={{ flex: sell || 0.1, background: "#dc2626", borderRadius: 4 }} title={`Sell ${sell}%`} />
    </div>
  )
}

/* ─── STOCK DETAIL PANEL ─────────────────────────────────────────────────── */
function StockDetail({ stock }) {
  const [activeTab, setActiveTab] = useState("Activity")
  const p = stock.performance
  const a = stock.analyst

  return (
    <div className="wl-detail">
      {/* Header */}
      <div className="wl-detail-header">
        <div>
          <div className="wl-detail-symbol">
            {stock.symbol}
            <span className="wl-badge">{stock.exchange}</span>
          </div>
          <div className="wl-detail-name">{stock.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="wl-detail-price">₹{fmtN(stock.ltp)}</div>
          <div className={`wl-detail-change ${stock.positive ? "pos" : "neg"}`}>
            {stock.positive ? "+" : ""}{fmtN(stock.change)} ({stock.positive ? "+" : ""}{stock.changePct}%)
          </div>
        </div>
        <div className="wl-buysell">
          <button className="btn-buy">BUY</button>
          <button className="btn-sell">SELL</button>
        </div>
      </div>

      {/* Scrollable tabs */}
      <div className="wl-tabs-wrap">
        <div className="wl-tabs">
          {OVERVIEW_TABS.map(t => (
            <button key={t} className={`wl-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="wl-tab-content">

        {/* ── ACTIVITY ── */}
        {activeTab === "Activity" && (
          <div className="wl-grid">
            {/* Price Details */}
            <div className="wl-card">
              <div className="wl-card-title">Price Details</div>
              <div className="wl-kv-grid">
                {[
                  ["Open",    `₹${fmtN(stock.open)}`],
                  ["High",    `₹${fmtN(stock.high)}`],
                  ["Low",     `₹${fmtN(stock.low)}`],
                  ["Close",   `₹${fmtN(stock.close)}`],
                  ["Avg. Price", `₹${fmtN(stock.avgPrice)}`],
                  ["Volume",  stock.volume],
                  ["Open Interest", stock.oi],
                  ["Bid / Ask", `${fmtN(stock.bid)} / ${fmtN(stock.ask)}`],
                ].map(([k, v]) => (
                  <div key={k} className="wl-kv-row">
                    <span className="wl-kv-key">{k}</span>
                    <span className="wl-kv-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Circuit & 52W */}
            <div className="wl-card">
              <div className="wl-card-title">Circuit & 52-Week Range</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Lower / Upper circuit */}
                <div>
                  <div className="wl-range-label">
                    <span className="neg">↓ Lower Circuit</span>
                    <span className="pos">↑ Upper Circuit</span>
                  </div>
                  <div className="wl-range-bar-wrap">
                    <div className="wl-range-bar" style={{ background: "linear-gradient(to right, #fef2f2, #ecfdf5)" }}>
                      <div className="wl-range-marker" style={{
                        left: `${((stock.ltp - stock.lowerCircuit) / (stock.upperCircuit - stock.lowerCircuit)) * 100}%`
                      }} />
                    </div>
                  </div>
                  <div className="wl-range-label">
                    <span className="neg mono">₹{fmtN(stock.lowerCircuit)}</span>
                    <span className="pos mono">₹{fmtN(stock.upperCircuit)}</span>
                  </div>
                </div>
                {/* 52W */}
                <div>
                  <div className="wl-range-label">
                    <span className="neg">52W Low</span>
                    <span className="pos">52W High</span>
                  </div>
                  <div className="wl-range-bar-wrap">
                    <div className="wl-range-bar" style={{ background: "linear-gradient(to right, #fef2f2, #ecfdf5)" }}>
                      <div className="wl-range-marker" style={{
                        left: `${((stock.ltp - stock.weekLow) / (stock.weekHigh - stock.weekLow)) * 100}%`
                      }} />
                    </div>
                  </div>
                  <div className="wl-range-label">
                    <span className="neg mono">₹{fmtN(stock.weekLow)}</span>
                    <span className="pos mono">₹{fmtN(stock.weekHigh)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYST RATINGS & FUNDAMENTALS ── */}
        {activeTab === "Analyst Ratings & Fundamental Ratios" && (
          <div className="wl-grid">
            <div className="wl-card">
              <div className="wl-card-title">Analyst Ratings</div>
              <div style={{ fontSize: "0.68rem", color: "#9ca3af", marginBottom: "0.75rem" }}>
                Based on {a.count} analyst(s) in the last 1 year(s)
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.25rem" }}>
                <div>
                  <div className="wl-kv-key">Target Price</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "1.2rem", fontWeight: 600, color: "#111827" }}>
                    ₹{fmtN(a.target)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="wl-kv-key">Expected</div>
                  <div className={`wl-stat-val ${pos(a.expectedPct) ? "pos" : "neg"}`}>
                    {pos(a.expectedPct) ? "+" : ""}{a.expectedPct}%
                  </div>
                </div>
              </div>
              <AnalystBar buy={a.buy} hold={a.hold} sell={a.sell} />
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
                {[["Buy", a.buy, "#059669"], ["Hold", a.hold, "#f59e0b"], ["Sell", a.sell, "#dc2626"]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ color: "#6b7280" }}>{l}</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", color: "#111827" }}>{v}%</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: "0.6rem", color: "#9ca3af", marginTop: "0.75rem" }}>powered by Trendlyn</div>
            </div>

            <div className="wl-card">
              <div className="wl-card-title">Fundamental Ratios</div>
              <div className="wl-kv-grid">
                {[
                  ["PE Ratio",        stock.fundamentals.pe],
                  ["Price to Book",   stock.fundamentals.pb],
                  ["PEG Ratio",       stock.fundamentals.peg],
                  ["ROE (Latest)",    stock.fundamentals.roe],
                  ["ROA (Latest)",    stock.fundamentals.roa],
                ].map(([k, v]) => (
                  <div key={k} className="wl-kv-row">
                    <span className="wl-kv-key">{k}</span>
                    <span className="wl-kv-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PERFORMANCE OVERVIEW ── */}
        {activeTab === "Performance Overview" && (
          <div className="wl-grid">
            <div className="wl-card">
              <div className="wl-card-title">Sector & Market</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span className="wl-pill">{p.cap}</span>
                <span className="wl-pill">{p.sector}</span>
                <span className="wl-pill">Rank #{p.sectorRank}</span>
              </div>
              <div className="wl-kv-grid">
                {[
                  ["Short Term",   p.shortTerm],
                  ["Long Term",    p.longTerm],
                  ["Market Cap",   p.marketCap],
                  ["1Y Return",    p.oneYearReturn],
                  ["Sector Return",p.sectorReturn],
                  ["Market Return",p.marketReturn],
                ].map(([k, v]) => (
                  <div key={k} className="wl-kv-row">
                    <span className="wl-kv-key">{k}</span>
                    <span className="wl-kv-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wl-card">
              <div className="wl-card-title">Ratings</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  ["Quality",          p.quality],
                  ["Valuation",        p.valuation],
                  ["Financial",        p.financial],
                ].map(([label, r]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="wl-kv-key" style={{ textTransform: "none", fontSize: "0.78rem" }}>{label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#374151" }}>{r.label}</span>
                      <ScoreDots score={r.score} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SHAREHOLDING ── */}
        {activeTab === "Shareholding Patterns" && (
          <div className="wl-card" style={{ maxWidth: 500 }}>
            <div className="wl-card-title">Shareholding Pattern — Dec 25</div>
            {/* Stacked bar */}
            <div style={{ display: "flex", height: 14, borderRadius: 6, overflow: "hidden", gap: 2, margin: "0.75rem 0" }}>
              {stock.shareholding.dec.map((s, i) => (
                <div key={s.label} style={{ flex: s.pct, background: SHAREHOLDING_COLORS[i] }} title={`${s.label}: ${s.pct}%`} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {stock.shareholding.dec.map((s, i) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: SHAREHOLDING_COLORS[i], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: "0.78rem", color: "#374151" }}>{s.label}</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: "#111827" }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── OTHER TABS placeholder ── */}
        {!["Activity", "Analyst Ratings & Fundamental Ratios", "Performance Overview", "Shareholding Patterns"].includes(activeTab) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "30vh", color: "#d1d5db", gap: "0.5rem" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
            </svg>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{activeTab} — coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── WATCHLIST PAGE ─────────────────────────────────────────────────────── */
export default function Watchlist() {
  const [selected, setSelected] = useState(WATCHLIST[0])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;600;700&display=swap');

        .wl-page {
          display: flex;
          height: calc(100vh - 56px);
          background: #f9fafb;
          font-family: 'Syne', sans-serif;
          overflow: hidden;
        }

        /* ── Left panel ── */
        .wl-list {
          width: 240px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .wl-list-header {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .wl-list-body { flex: 1; overflow-y: auto; }
        .wl-list-body::-webkit-scrollbar { width: 3px; }
        .wl-list-body::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

        .wl-stock-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f9fafb;
          transition: background 0.12s;
          gap: 0.5rem;
        }
        .wl-stock-row:hover   { background: #f9fafb; }
        .wl-stock-row.active  { background: #ecfdf5; border-left: 3px solid #059669; padding-left: calc(1rem - 3px); }

        .wl-row-left  { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .wl-row-sym   { font-size: 0.78rem; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .wl-row-name  { font-size: 0.62rem; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
        .wl-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; flex-shrink: 0; }
        .wl-row-price { font-family: 'DM Mono', monospace; font-size: 0.78rem; font-weight: 500; color: #111827; }
        .wl-row-chg   { font-family: 'DM Mono', monospace; font-size: 0.65rem; }
        .wl-row-chg.pos { color: #059669; }
        .wl-row-chg.neg { color: #dc2626; }

        /* ── Right panel ── */
        .wl-detail {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #f9fafb;
        }

        .wl-detail-header {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .wl-detail-symbol {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .wl-badge {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          background: #f3f4f6;
          color: #6b7280;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        .wl-detail-name  { font-size: 0.72rem; color: #9ca3af; margin-top: 0.1rem; }
        .wl-detail-price { font-family: 'DM Mono', monospace; font-size: 1.4rem; font-weight: 600; color: #111827; }
        .wl-detail-change { font-family: 'DM Mono', monospace; font-size: 0.8rem; }
        .wl-detail-change.pos { color: #059669; }
        .wl-detail-change.neg { color: #dc2626; }

        .wl-buysell { display: flex; gap: 0.5rem; margin-left: auto; }
        .btn-buy, .btn-sell {
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.35rem 1.1rem;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          transition: opacity 0.15s;
        }
        .btn-buy  { background: #059669; color: #fff; }
        .btn-sell { background: #dc2626; color: #fff; }
        .btn-buy:hover, .btn-sell:hover { opacity: 0.88; }

        /* ── Tabs ── */
        .wl-tabs-wrap {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .wl-tabs-wrap::-webkit-scrollbar { display: none; }
        .wl-tabs { display: flex; padding: 0 1rem; white-space: nowrap; }
        .wl-tab {
          font-family: 'Syne', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: #6b7280;
          padding: 0.65rem 0.9rem;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .wl-tab:hover  { color: #111827; }
        .wl-tab.active { color: #059669; border-bottom-color: #059669; }

        /* ── Tab content ── */
        .wl-tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1.5rem;
        }
        .wl-tab-content::-webkit-scrollbar { width: 4px; }
        .wl-tab-content::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

        .wl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 900px) { .wl-grid { grid-template-columns: 1fr; } }

        .wl-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .wl-card-title {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 0.85rem;
        }

        .wl-kv-grid  { display: flex; flex-direction: column; gap: 0; }
        .wl-kv-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.45rem 0;
          border-bottom: 1px solid #f9fafb;
          gap: 0.5rem;
        }
        .wl-kv-row:last-child { border-bottom: none; }
        .wl-kv-key { font-size: 0.72rem; color: #6b7280; }
        .wl-kv-val { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #111827; text-align: right; }

        .wl-range-label { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
        .wl-range-bar-wrap { position: relative; height: 8px; margin-bottom: 0.3rem; }
        .wl-range-bar { height: 100%; border-radius: 4px; }
        .wl-range-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #111827;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }

        .wl-pill {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.55rem;
          border-radius: 20px;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .wl-stat-val { font-family: 'DM Mono', monospace; font-size: 0.9rem; font-weight: 600; }

        .pos   { color: #059669; }
        .neg   { color: #dc2626; }
        .mono  { font-family: 'DM Mono', monospace; font-size: 0.7rem; }
      `}</style>

      <div className="wl-page">
        {/* ── Left: stock list ── */}
        <div className="wl-list">
          <div className="wl-list-header">My Watchlist · {WATCHLIST.length}</div>
          <div className="wl-list-body">
            {WATCHLIST.map(s => (
              <div
                key={s.symbol}
                className={`wl-stock-row ${selected?.symbol === s.symbol ? "active" : ""}`}
                onClick={() => setSelected(s)}
              >
                <div className="wl-row-left">
                  <div className="wl-row-sym">{s.symbol}</div>
                  <div className="wl-row-name">{s.name}</div>
                </div>
                <div className="wl-row-right">
                  <div className="wl-row-price">₹{fmtN(s.ltp)}</div>
                  <div className={`wl-row-chg ${s.positive ? "pos" : "neg"}`}>
                    {s.positive ? "+" : ""}{s.changePct}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: detail ── */}
        {selected
          ? <StockDetail key={selected.symbol} stock={selected} />
          : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.85rem" }}>
              Select a stock to view details
            </div>
        }
      </div>
    </>
  )
}