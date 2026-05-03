import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getStockDetails, getStockHistory } from "@/services/marketService"
import { watchlistService } from "@/services/watchlist"
import OrderModal from "@/components/OrderModal"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts"

/* ── tiny helpers ── */
function fmt(n, decimals = 2) {
  if (n == null) return "—"
  if (Math.abs(n) >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`
  return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: decimals })}`
}
function pct(n) {
  if (n == null) return "—"
  return `${(n * 100).toFixed(2)}%`
}
function pctRaw(n) {
  if (n == null) return "—"
  return `${Number(n).toFixed(2)}%`
}

export default function StockDetails() {
  const { symbol } = useParams()
  const navigate = useNavigate()
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Order Placement Modal
  const [orderModal, setOrderModal] = useState({ open: false, action: 'BUY' })

  // Watchlist add-to dropdown
  const [watchlists, setWatchlists] = useState([])
  const [wlDropdownOpen, setWlDropdownOpen] = useState(false)
  const [addingToWl, setAddingToWl] = useState(null) // id of wl being added to
  const [addedToWl, setAddedToWl] = useState(null)   // id of wl just added to (for toast)
  const wlDropdownRef = useRef(null)

  // Chart state
  const [chartPeriod, setChartPeriod] = useState("1M")
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(false)

  // Load stock details
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getStockDetails(symbol)
        if (!cancelled) setStock(data)
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.detail || "Failed to fetch stock details")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [symbol])

  // Fetch watchlists for the "add to" dropdown
  useEffect(() => {
    async function loadWatchlists() {
      try {
        const { data } = await watchlistService.getAll()
        setWatchlists(data.watchlists || [])
      } catch { /* silently ignore — button just won't appear */ }
    }
    loadWatchlists()
  }, [])

  // Load chart
  useEffect(() => {
    async function loadChart() {
      setChartLoading(true)
      try {
        let period = "1mo", interval = "1d"
        if (chartPeriod === "1D") { period = "1d"; interval = "5m" }
        else if (chartPeriod === "1W") { period = "5d"; interval = "15m" }
        else if (chartPeriod === "1M") { period = "1mo"; interval = "1d" }
        else if (chartPeriod === "1Y") { period = "1y"; interval = "1d" }
        else if (chartPeriod === "MAX") { period = "max"; interval = "1wk" }

        const data = await getStockHistory(symbol, period, interval)
        const formatted = data.map(d => {
          let dateStr = ""
          try {
            const date = new Date(d.timestamp)
            if (chartPeriod === "1D") dateStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            else if (chartPeriod === "1W") dateStr = date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' })
            else if (chartPeriod === "MAX") dateStr = date.getFullYear().toString()
            else dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
          } catch (e) { dateStr = d.timestamp }
          return { ...d, dateStr }
        })
        setChartData(formatted)
      } catch (e) {
        console.error("Failed to load chart", e)
      } finally {
        setChartLoading(false)
      }
    }
    loadChart()
  }, [symbol, chartPeriod])

  // Click outside to close wl dropdown
  useEffect(() => {
    function handleClick(e) {
      if (wlDropdownRef.current && !wlDropdownRef.current.contains(e.target)) {
        setWlDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleAddToWatchlist(wlId) {
    const ticker = (d.symbol || stock.symbol || symbol).toUpperCase()
    try {
      setAddingToWl(wlId)
      await watchlistService.addStock(wlId, ticker)
      setAddedToWl(wlId)
      setTimeout(() => setAddedToWl(null), 2000)
      setWlDropdownOpen(false)
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add stock")
    } finally {
      setAddingToWl(null)
    }
  }

  const d = stock?.other_details ?? {}
  const priceChange = d.regularMarketChange
  const priceChangePct = d.regularMarketChangePercent
  const isPositive = priceChange >= 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Syne:wght@600;700&display=swap');

        .sd-page {
          font-family: 'Inter', sans-serif;
          background: #f8f9fb; min-height: calc(100vh - 56px);
          padding: 1.5rem 2rem 3rem;
          color: #111827;
        }
        .sd-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.78rem; font-weight: 500; color: #6b7280;
          cursor: pointer; margin-bottom: 1rem; border: none;
          background: none; padding: 0; transition: color 0.15s;
        }
        .sd-back:hover { color: #059669; }

        /* ── header ── */
        .sd-header { margin-bottom: 1.5rem; }
        .sd-header-top { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
        .sd-name { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 700; color: #111827; }
        .sd-ticker-badge {
          font-family: 'DM Mono', monospace; font-size: 0.7rem; font-weight: 500;
          background: #ecfdf5; color: #059669; padding: 3px 10px;
          border-radius: 6px; letter-spacing: 0.04em;
        }
        .sd-exchange-badge {
          font-family: 'DM Mono', monospace; font-size: 0.6rem;
          background: #f3f4f6; color: #6b7280; padding: 3px 8px;
          border-radius: 4px;
        }
        .sd-sector { font-size: 0.78rem; color: #6b7280; margin-top: 0.25rem; }
        .sd-sector span { color: #059669; font-weight: 500; }

        /* ── price hero ── */
        .sd-price-hero {
          display: flex; align-items: baseline; gap: 1rem; margin-top: 0.75rem; flex-wrap: wrap;
        }
        .sd-price {
          font-family: 'DM Mono', monospace; font-size: 2.2rem; font-weight: 700; color: #111827;
        }
        .sd-change {
          font-family: 'DM Mono', monospace; font-size: 0.95rem; font-weight: 600;
          padding: 4px 10px; border-radius: 6px;
        }
        .sd-change.positive { background: #ecfdf5; color: #059669; }
        .sd-change.negative { background: #fef2f2; color: #dc2626; }

        /* ── grid ── */
        .sd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem; }
        @media (max-width: 900px) { .sd-grid { grid-template-columns: 1fr; } }

        /* ── card ── */
        .sd-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          padding: 1.25rem 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .sd-card-title {
          font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700;
          color: #374151; margin-bottom: 1rem; text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── key-value rows ── */
        .sd-kv { display: flex; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #f3f4f6; }
        .sd-kv:last-child { border-bottom: none; }
        .sd-kv-label { font-size: 0.78rem; color: #6b7280; }
        .sd-kv-value { font-family: 'DM Mono', monospace; font-size: 0.78rem; font-weight: 500; color: #111827; text-align: right; }

        /* ── range bar ── */
        .sd-range { margin: 0.6rem 0; }
        .sd-range-labels { display: flex; justify-content: space-between; font-size: 0.68rem; color: #9ca3af; margin-bottom: 4px; }
        .sd-range-bar { height: 6px; background: #e5e7eb; border-radius: 3px; position: relative; }
        .sd-range-fill { height: 100%; background: linear-gradient(90deg, #059669, #34d399); border-radius: 3px; }
        .sd-range-dot {
          position: absolute; top: 50%; transform: translate(-50%, -50%);
          width: 12px; height: 12px; background: #059669; border: 2px solid #fff;
          border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }

        /* ── recommendation badge ── */
        .sd-rec-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'DM Mono', monospace; font-size: 0.82rem; font-weight: 600;
          padding: 6px 14px; border-radius: 8px; text-transform: uppercase;
        }
        .sd-rec-badge.buy     { background: #ecfdf5; color: #059669; }
        .sd-rec-badge.sell    { background: #fef2f2; color: #dc2626; }
        .sd-rec-badge.hold    { background: #fffbeb; color: #d97706; }
        .sd-rec-badge.default { background: #f3f4f6; color: #6b7280; }

        /* ── officers table ── */
        .sd-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
        .sd-table th {
          font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #9ca3af;
          text-align: left; padding: 0.5rem 0.6rem; border-bottom: 2px solid #e5e7eb;
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .sd-table td { padding: 0.5rem 0.6rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
        .sd-table tr:last-child td { border-bottom: none; }
        .sd-table tr:hover td { background: #f9fafb; }

        /* ── summary ── */
        .sd-summary {
          font-size: 0.8rem; line-height: 1.65; color: #4b5563;
          max-height: 200px; overflow-y: auto;
        }

        /* ── full-width card ── */
        .sd-full { grid-column: 1 / -1; }

        /* ── loading / error ── */
        .sd-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 50vh; gap: 1rem;
        }
        .sd-loader {
          width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #059669;
          border-radius: 50%; animation: sd-spin 0.7s linear infinite;
        }
        @keyframes sd-spin { to { transform: rotate(360deg); } }
        .sd-error {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 50vh; gap: 0.75rem; color: #dc2626; font-size: 0.9rem;
        }
        .sd-error-btn {
          font-size: 0.78rem; padding: 0.4rem 1.2rem; border-radius: 8px;
          background: #059669; color: #fff; border: none; cursor: pointer;
          font-weight: 600; transition: background 0.15s;
        }
        .sd-error-btn:hover { background: #047857; }

        /* ── company link ── */
        .sd-link { color: #059669; text-decoration: none; font-weight: 500; }
        .sd-link:hover { text-decoration: underline; }

        /* ── add-to-watchlist ── */
        .sd-wl-wrap {
          position: relative; display: inline-flex; align-items: center;
        }
        .sd-wl-btn {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Syne', sans-serif; font-size: 0.72rem; font-weight: 700;
          background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;
          padding: 5px 12px; border-radius: 8px; cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .sd-wl-btn:hover { background: #d1fae5; border-color: #6ee7b7; }

        /* ── action buttons ── */
        .sd-actions {
          display: flex; gap: 0.75rem; align-items: center;
        }
        .sd-btn-buy {
          background: #059669; color: #fff; border: none;
          padding: 10px 32px; border-radius: 10px; font-weight: 700;
          font-family: 'Syne', sans-serif; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(5,150,105,0.2);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .sd-btn-buy:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5,150,105,0.3); }
        .sd-btn-buy:active { transform: translateY(0); }

        .sd-btn-sell {
          background: #dc2626; color: #fff; border: none;
          padding: 10px 32px; border-radius: 10px; font-weight: 700;
          font-family: 'Syne', sans-serif; font-size: 0.85rem;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(220,38,38,0.2);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .sd-btn-sell:hover { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(220,38,38,0.3); }
        .sd-btn-sell:active { transform: translateY(0); }

        .sd-wl-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12); min-width: 200px;
          z-index: 100; padding: 0.35rem 0; max-height: 240px; overflow-y: auto;
        }
        .sd-wl-dropdown-title {
          font-size: 0.62rem; font-weight: 700; color: #9ca3af;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.4rem 0.85rem 0.25rem;
        }
        .sd-wl-dropdown-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.5rem 0.85rem; cursor: pointer;
          font-size: 0.78rem; color: #374151;
          transition: background 0.12s; border: none; background: none;
          width: 100%; text-align: left; font-family: 'Syne', sans-serif;
        }
        .sd-wl-dropdown-item:hover { background: #ecfdf5; color: #059669; }
        .sd-wl-dropdown-item .sd-wl-count {
          font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #9ca3af;
        }
        .sd-wl-toast {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          background: #059669; color: #fff; padding: 0.6rem 1.2rem;
          border-radius: 10px; font-size: 0.8rem; font-weight: 600;
          box-shadow: 0 4px 16px rgba(5,150,105,0.3);
          animation: sd-toast-in 0.3s ease-out;
          z-index: 500;
        }
        @keyframes sd-toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        /* ── chart ── */
        .sd-chart-tabs { display: flex; gap: 0.5rem; }
        .sd-chart-tab {
          font-family: 'DM Mono', monospace; font-size: 0.7rem; font-weight: 600;
          padding: 4px 10px; border-radius: 6px; border: 1px solid #e5e7eb;
          background: #fff; color: #6b7280; cursor: pointer; transition: all 0.15s;
        }
        .sd-chart-tab.active { background: #059669; color: #fff; border-color: #059669; }
      `}</style>

      <div className="sd-page">
        <button className="sd-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* ── LOADING ── */}
        {loading && (
          <div className="sd-loading">
            <div className="sd-loader" />
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Loading stock details…</span>
          </div>
        )}

        {/* ── ERROR ── */}
        {!loading && error && (
          <div className="sd-error">
            <span>{error}</span>
            <button className="sd-error-btn" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        )}

        {/* ── DATA ── */}
        {!loading && stock && (
          <>
            {/* Header */}
            <div className="sd-header">
              <div className="sd-header-top">
                <span className="sd-name">{stock.company_name || d.longName}</span>
                <span className="sd-ticker-badge">{d.symbol || stock.symbol}</span>
                <span className="sd-exchange-badge">{d.fullExchangeName || d.exchange}</span>
                {/* Add to Watchlist */}
                {watchlists.length > 0 && (
                  <div className="sd-wl-wrap" ref={wlDropdownRef}>
                    <button className="sd-wl-btn" onClick={() => setWlDropdownOpen(v => !v)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Watchlist
                    </button>
                    {wlDropdownOpen && (
                      <div className="sd-wl-dropdown">
                        <div className="sd-wl-dropdown-title">Add to watchlist</div>
                        {watchlists.map(wl => (
                          <button
                            key={wl.id}
                            className="sd-wl-dropdown-item"
                            disabled={addingToWl === wl.id}
                            onClick={() => handleAddToWatchlist(wl.id)}
                          >
                            {wl.name}
                            <span className="sd-wl-count">
                              {addingToWl === wl.id ? "…" : `${(wl.stocks?.filter(s => s.active)?.length) || 0} stocks`}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {(d.sectorDisp || d.industryDisp) && (
                <div className="sd-sector">
                  {d.sectorDisp && <><span>{d.sectorDisp}</span></>}
                  {d.sectorDisp && d.industryDisp && " · "}
                  {d.industryDisp}
                </div>
              )}

              <div className="sd-price-hero" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <span className="sd-price">₹{Number(stock.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                  {priceChange != null && (
                    <span className={`sd-change ${isPositive ? "positive" : "negative"}`}>
                      {isPositive ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}
                      {priceChangePct != null && ` (${Math.abs(priceChangePct).toFixed(2)}%)`}
                    </span>
                  )}
                </div>
                <div className="sd-actions">
                  <button className="sd-btn-buy" onClick={() => setOrderModal({ open: true, action: 'BUY' })}>Buy</button>
                  <button className="sd-btn-sell" onClick={() => setOrderModal({ open: true, action: 'SELL' })}>Sell</button>
                </div>
              </div>
            </div>

            <div className="sd-grid">
              {/* ── Chart ── */}
              <div className="sd-card sd-full" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div className="sd-card-title" style={{ margin: 0 }}>Price History</div>
                  <div className="sd-chart-tabs">
                    {["1D", "1W", "1M", "1Y", "MAX"].map(p => (
                      <button key={p} className={`sd-chart-tab ${chartPeriod === p ? "active" : ""}`} onClick={() => setChartPeriod(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ width: "100%", height: 320, position: "relative" }}>
                  {chartLoading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", zIndex: 10 }}>
                      <div className="sd-loader" style={{ width: 24, height: 24, borderWidth: 2 }} />
                    </div>
                  )}
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="dateStr"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "DM Mono" }}
                          dy={10}
                          minTickGap={20}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#9ca3af", fontFamily: "DM Mono" }}
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}
                          itemStyle={{ fontFamily: 'DM Mono', fontSize: '14px', color: '#111827', fontWeight: 600 }}
                          formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Price"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#059669"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    !chartLoading && <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.8rem" }}>No chart data available for this period.</div>
                  )}
                </div>
              </div>

              {/* ── Day Range ── */}
              <div className="sd-card">
                <div className="sd-card-title">Today's Range</div>
                {renderRange("Day Low", stock.day_low, stock.day_high, stock.price, "Day High")}
                <div style={{ marginTop: "1rem" }} />
                <div className="sd-card-title" style={{ marginBottom: "0.6rem" }}>52-Week Range</div>
                {renderRange("52W Low", d.fiftyTwoWeekLow, d.fiftyTwoWeekHigh, stock.price, "52W High")}
                <div style={{ marginTop: "1rem" }} />
                <div className="sd-kv"><span className="sd-kv-label">Previous Close</span><span className="sd-kv-value">₹{d.previousClose}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Open</span><span className="sd-kv-value">₹{d.open}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Volume</span><span className="sd-kv-value">{Number(d.volume ?? 0).toLocaleString("en-IN")}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Avg Volume (10d)</span><span className="sd-kv-value">{Number(d.averageDailyVolume10Day ?? 0).toLocaleString("en-IN")}</span></div>
              </div>

              {/* ── Key Metrics ── */}
              <div className="sd-card">
                <div className="sd-card-title">Key Metrics</div>
                <div className="sd-kv"><span className="sd-kv-label">Market Cap</span><span className="sd-kv-value">{fmt(d.marketCap)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Enterprise Value</span><span className="sd-kv-value">{fmt(d.enterpriseValue)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Trailing P/E</span><span className="sd-kv-value">{d.trailingPE?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Forward P/E</span><span className="sd-kv-value">{d.forwardPE?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">PEG Ratio</span><span className="sd-kv-value">{d.pegRatio?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Price to Book</span><span className="sd-kv-value">{d.priceToBook?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">EPS (TTM)</span><span className="sd-kv-value">₹{d.trailingEps?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Beta</span><span className="sd-kv-value">{d.beta?.toFixed(3) ?? "—"}</span></div>
              </div>

              {/* ── Dividends & Returns ── */}
              <div className="sd-card">
                <div className="sd-card-title">Dividends & Returns</div>
                <div className="sd-kv"><span className="sd-kv-label">Dividend Rate</span><span className="sd-kv-value">₹{d.dividendRate ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Dividend Yield</span><span className="sd-kv-value">{pctRaw(d.dividendYield)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Payout Ratio</span><span className="sd-kv-value">{pct(d.payoutRatio)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">5Y Avg Div Yield</span><span className="sd-kv-value">{pctRaw(d.fiveYearAvgDividendYield)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Return on Equity</span><span className="sd-kv-value">{pct(d.returnOnEquity)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Return on Assets</span><span className="sd-kv-value">{pct(d.returnOnAssets)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Revenue Growth</span><span className="sd-kv-value">{pct(d.revenueGrowth)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Earnings Growth</span><span className="sd-kv-value">{pct(d.earningsGrowth)}</span></div>
              </div>

              {/* ── Financials ── */}
              <div className="sd-card">
                <div className="sd-card-title">Financials</div>
                <div className="sd-kv"><span className="sd-kv-label">Total Revenue</span><span className="sd-kv-value">{fmt(d.totalRevenue)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">EBITDA</span><span className="sd-kv-value">{fmt(d.ebitda)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Net Income</span><span className="sd-kv-value">{fmt(d.netIncomeToCommon)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Free Cash Flow</span><span className="sd-kv-value">{fmt(d.freeCashflow)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Total Cash</span><span className="sd-kv-value">{fmt(d.totalCash)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Total Debt</span><span className="sd-kv-value">{fmt(d.totalDebt)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Debt to Equity</span><span className="sd-kv-value">{d.debtToEquity?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Current Ratio</span><span className="sd-kv-value">{d.currentRatio?.toFixed(2) ?? "—"}</span></div>
              </div>

              {/* ── Analyst Ratings ── */}
              <div className="sd-card">
                <div className="sd-card-title">Analyst Ratings</div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <span className={`sd-rec-badge ${recClass(d.recommendationKey)}`}>
                    {d.recommendationKey ?? "N/A"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af", marginLeft: "0.5rem" }}>
                    {d.numberOfAnalystOpinions ?? 0} analysts
                  </span>
                </div>
                <div className="sd-kv"><span className="sd-kv-label">Target Mean</span><span className="sd-kv-value">₹{d.targetMeanPrice?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Target Median</span><span className="sd-kv-value">₹{d.targetMedianPrice?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Target High</span><span className="sd-kv-value">₹{d.targetHighPrice?.toFixed(2) ?? "—"}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Target Low</span><span className="sd-kv-value">₹{d.targetLowPrice?.toFixed(2) ?? "—"}</span></div>
              </div>

              {/* ── Margins ── */}
              <div className="sd-card">
                <div className="sd-card-title">Margins</div>
                <div className="sd-kv"><span className="sd-kv-label">Gross Margin</span><span className="sd-kv-value">{pct(d.grossMargins)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Operating Margin</span><span className="sd-kv-value">{pct(d.operatingMargins)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">EBITDA Margin</span><span className="sd-kv-value">{pct(d.ebitdaMargins)}</span></div>
                <div className="sd-kv"><span className="sd-kv-label">Profit Margin</span><span className="sd-kv-value">{pct(d.profitMargins)}</span></div>
              </div>

              {/* ── Company Officers ── */}
              {d.companyOfficers?.length > 0 && (
                <div className="sd-card sd-full">
                  <div className="sd-card-title">Company Officers</div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="sd-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Title</th>
                          <th>Age</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.companyOfficers.map((o, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{o.name}</td>
                            <td>{o.title}</td>
                            <td style={{ fontFamily: "'DM Mono', monospace" }}>{o.age ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── About ── */}
              {(d.longBusinessSummary || d.website) && (
                <div className="sd-card sd-full">
                  <div className="sd-card-title">About {stock.company_name}</div>
                  {d.website && (
                    <div style={{ marginBottom: "0.6rem", fontSize: "0.78rem" }}>
                      <a className="sd-link" href={d.website} target="_blank" rel="noopener noreferrer">{d.website}</a>
                    </div>
                  )}
                  {(d.address1 || d.city) && (
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.6rem" }}>
                      {[d.address1, d.address2, d.city, d.zip, d.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {d.longBusinessSummary && (
                    <div className="sd-summary">{d.longBusinessSummary}</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {addedToWl && (
        <div className="sd-wl-toast">
          ✓ Added to {watchlists.find(w => w.id === addedToWl)?.name || "watchlist"}
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={orderModal.open}
        onClose={() => setOrderModal({ ...orderModal, open: false })}
        stock={stock || { symbol: (d.symbol || symbol).toUpperCase(), exchange: d.exchange }}
        initialAction={orderModal.action}
        currentPrice={stock?.price}
      />
    </>
  )
}

/* ── range bar helper ── */
function renderRange(lowLabel, low, high, current, highLabel) {
  if (low == null || high == null) return null
  const range = high - low
  const fillPct = range > 0 ? Math.min(100, Math.max(0, ((current - low) / range) * 100)) : 50
  return (
    <div className="sd-range">
      <div className="sd-range-labels">
        <span>{lowLabel}: ₹{Number(low).toLocaleString("en-IN")}</span>
        <span>{highLabel}: ₹{Number(high).toLocaleString("en-IN")}</span>
      </div>
      <div className="sd-range-bar">
        <div className="sd-range-fill" style={{ width: `${fillPct}%` }} />
        <div className="sd-range-dot" style={{ left: `${fillPct}%` }} />
      </div>
    </div>
  )
}

/* ── recommendation color ── */
function recClass(key) {
  if (!key) return "default"
  const k = key.toLowerCase()
  if (k.includes("buy") || k.includes("strong")) return "buy"
  if (k.includes("sell") || k.includes("under")) return "sell"
  if (k.includes("hold") || k.includes("neutral")) return "hold"
  return "default"
}
