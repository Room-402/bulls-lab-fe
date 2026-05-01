import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { watchlistService } from "../../services/watchlist"
import { getStockDetailsBatch } from "@/services/marketService"
import StockSearch from "@/components/StockSearch"

/* ─── STOCK DETAIL PANEL ─────────────────────────────────────────────────── */
function StockDetail({ ticker, marketData, onViewFull }) {
  const info = marketData || {}
  const hasPrice = info.price != null
  return (
    <div className="wl-detail">
      <div className="wl-detail-header">
        <div>
          <div className="wl-detail-symbol">
            {ticker}
            <span className="wl-badge">NSE</span>
          </div>
          <div className="wl-detail-name">{info.company_name || "—"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          {onViewFull && (
            <button className="btn-view-full" onClick={onViewFull}>View Full Details →</button>
          )}
          <div className="wl-buysell">
            <button className="btn-buy">BUY</button>
            <button className="btn-sell">SELL</button>
          </div>
        </div>
      </div>
      {hasPrice ? (
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "2rem", fontWeight: 700, color: "#111827" }}>
            ₹{Number(info.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: "flex", gap: "2rem", fontSize: "0.78rem", color: "#6b7280" }}>
            <span>Day Low: <strong style={{ color: "#dc2626" }}>₹{info.day_low ?? "—"}</strong></span>
            <span>Day High: <strong style={{ color: "#059669" }}>₹{info.day_high ?? "—"}</strong></span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", color: "#d1d5db" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Market data unavailable</p>
        </div>
      )}
    </div>
  )
}

/* ─── WATCHLIST PAGE ─────────────────────────────────────────────────────── */
export default function Watchlist() {
  const navigate = useNavigate()
  const [watchlists, setWatchlists] = useState([])
  const [selectedWL, setSelectedWL] = useState(null)
  const [selectedTicker, setSelectedTicker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Watchlist management UI state
  const [showWLMenu, setShowWLMenu] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editNameVal, setEditNameVal] = useState("")
  const [creatingWL, setCreatingWL] = useState(false)
  const [newWLName, setNewWLName] = useState("")

  // Stock management — no more plain text input
  const [addingStock, setAddingStock] = useState(false)

  // Batch market data from market-service
  const [marketData, setMarketData] = useState({}) // { TICKER: { price, day_high, ... } }

  const menuRef = useRef(null)

  useEffect(() => {
    fetchWatchlists()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowWLMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch batch market data when selected watchlist changes
  useEffect(() => {
    async function fetchMarketData() {
      const activeStks = selectedWL?.stocks?.filter(s => s.active) || []
      if (activeStks.length === 0) { setMarketData({}); return }
      const symbols = activeStks.map(s => s.stock_ticker)
      try {
        const data = await getStockDetailsBatch(symbols)
        setMarketData(data)
      } catch { setMarketData({}) }
    }
    fetchMarketData()
  }, [selectedWL])

  async function fetchWatchlists() {
    try {
      setLoading(true)
      setError(null)
      const { data } = await watchlistService.getAll()
      const wls = data.watchlists || []
      setWatchlists(wls)
      if (wls.length > 0) setSelectedWL(wls[0])
    } catch (e) {
      setError("Failed to load watchlists")
    } finally {
      setLoading(false)
    }
  }

  function syncWL(updated) {
    setSelectedWL(updated)
    setWatchlists(prev => prev.map(w => w.id === updated.id ? updated : w))
  }

  async function handleCreateWL() {
    if (!newWLName.trim()) return
    try {
      const { data } = await watchlistService.create(newWLName.trim())
      const wl = { ...data, stocks: [] }
      setWatchlists(prev => [...prev, wl])
      setSelectedWL(wl)
      setSelectedTicker(null)
      setNewWLName("")
      setCreatingWL(false)
    } catch (e) {
      alert(e.response?.data?.error || "Failed to create watchlist")
    }
  }

  async function handleRenameWL() {
    if (!editNameVal.trim() || !selectedWL) return
    try {
      await watchlistService.update(selectedWL.id, editNameVal.trim())
      syncWL({ ...selectedWL, name: editNameVal.trim() })
      setEditingName(false)
    } catch (e) {
      alert(e.response?.data?.error || "Failed to rename watchlist")
    }
  }

  async function handleDeleteWL() {
    if (!selectedWL || !window.confirm(`Delete "${selectedWL.name}"?`)) return
    try {
      await watchlistService.remove(selectedWL.id)
      const remaining = watchlists.filter(w => w.id !== selectedWL.id)
      setWatchlists(remaining)
      setSelectedWL(remaining[0] || null)
      setSelectedTicker(null)
    } catch (e) {
      alert(e.response?.data?.error || "Failed to delete watchlist")
    }
  }

  async function handleSearchAddStock(item) {
    if (!selectedWL) return
    const ticker = item.ticker.toUpperCase()
    try {
      setAddingStock(true)
      const { data } = await watchlistService.addStock(selectedWL.id, ticker)
      const existingStocks = selectedWL.stocks || []
      const without = existingStocks.filter(s => s.stock_ticker !== ticker)
      syncWL({ ...selectedWL, stocks: [...without, data] })
    } catch (e) {
      alert(e.response?.data?.error || "Failed to add stock")
    } finally {
      setAddingStock(false)
    }
  }

  async function handleRemoveStock(stock) {
    if (!selectedWL) return
    try {
      await watchlistService.removeStock(selectedWL.id, stock.stock_ticker)
      const updatedStocks = selectedWL.stocks.map(s =>
        s.id === stock.id ? { ...s, active: false } : s
      )
      syncWL({ ...selectedWL, stocks: updatedStocks })
      if (selectedTicker === stock.stock_ticker) setSelectedTicker(null)
    } catch (e) {
      alert(e.response?.data?.error || "Failed to remove stock")
    }
  }

  const activeStocks = selectedWL?.stocks?.filter(s => s.active) || []

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

        /* ── Sidebar ── */
        .wl-list {
          width: 340px;
          flex-shrink: 0;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        /* ── Watchlist selector ── */
        .wl-selector-wrap {
          position: relative;
          border-bottom: 1px solid #f3f4f6;
        }
        .wl-selector-row {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0.6rem 0.75rem;
        }
        .wl-selector-btn {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-align: left;
          min-width: 0;
          font-family: 'Syne', sans-serif;
        }
        .wl-selector-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 110px;
        }
        .wl-selector-arrow {
          color: #9ca3af;
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .wl-selector-arrow.open { transform: rotate(180deg); }

        .wl-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          transition: color 0.12s, background 0.12s;
          flex-shrink: 0;
        }
        .wl-icon-btn:hover { color: #374151; background: #f3f4f6; }
        .wl-icon-btn.danger:hover { color: #dc2626; background: #fef2f2; }
        .wl-icon-btn.add:hover { color: #059669; background: #ecfdf5; }

        /* Dropdown */
        .wl-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-top: none;
          z-index: 50;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          max-height: 200px;
          overflow-y: auto;
        }
        .wl-dropdown-item {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.55rem 0.85rem;
          text-align: left;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem;
          color: #374151;
          transition: background 0.1s;
        }
        .wl-dropdown-item:hover { background: #f9fafb; }
        .wl-dropdown-item.active { color: #059669; font-weight: 700; background: #ecfdf5; }

        /* Inline forms */
        .wl-inline-form {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.5rem 0.75rem;
          border-top: 1px solid #f3f4f6;
        }
        .wl-inline-input {
          flex: 1;
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 5px;
          padding: 0.3rem 0.5rem;
          outline: none;
          color: #111827;
          min-width: 0;
        }
        .wl-inline-input:focus { border-color: #059669; }
        .wl-inline-confirm {
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.3rem 0.55rem;
          border-radius: 5px;
          border: none;
          cursor: pointer;
          background: #059669;
          color: #fff;
          flex-shrink: 0;
        }
        .wl-inline-confirm:hover { opacity: 0.88; }
        .wl-inline-cancel {
          font-size: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 0.2rem 0.3rem;
          flex-shrink: 0;
        }
        .wl-inline-cancel:hover { color: #374151; }

        /* Stock count header */
        .wl-list-header {
          padding: 0.6rem 1rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        /* Stock list body */
        .wl-list-body { flex: 1; overflow-y: auto; }
        .wl-list-body::-webkit-scrollbar { width: 3px; }
        .wl-list-body::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }

        .wl-empty-msg {
          padding: 2rem 1rem;
          text-align: center;
          font-size: 0.72rem;
          color: #d1d5db;
        }

        .wl-stock-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f9fafb;
          transition: background 0.12s;
          gap: 0.5rem;
        }
        .wl-stock-row:hover { background: #f9fafb; }
        .wl-stock-row:hover .wl-row-del { opacity: 1; }
        .wl-stock-row.active { background: #ecfdf5; border-left: 3px solid #059669; padding-left: calc(1rem - 3px); }

        .wl-row-sym {
          font-size: 0.78rem;
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .wl-row-del {
          opacity: 0;
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 1rem;
          line-height: 1;
          padding: 0 0.15rem;
          flex-shrink: 0;
          transition: color 0.12s, opacity 0.12s;
        }
        .wl-row-del:hover { color: #dc2626; }

        /* Add stock footer */
        .wl-add-stock {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 0.75rem;
          border-top: 1px solid #f3f4f6;
        }
        .wl-add-input {
          flex: 1;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem;
          border: 1px solid #e5e7eb;
          border-radius: 5px;
          padding: 0.3rem 0.5rem;
          outline: none;
          color: #111827;
          text-transform: uppercase;
          min-width: 0;
        }
        .wl-add-input:focus { border-color: #059669; }
        .wl-add-input::placeholder { text-transform: none; color: #d1d5db; }
        .wl-add-btn {
          font-family: 'Syne', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          background: #059669;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }
        .wl-add-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .wl-add-btn:not(:disabled):hover { opacity: 0.88; }

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
        .wl-detail-name { font-size: 0.72rem; color: #9ca3af; margin-top: 0.1rem; }

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
        .btn-view-full {
          font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700;
          background: #f3f4f6; color: #059669; border: 1px solid #e5e7eb;
          padding: 0.35rem 0.9rem; border-radius: 6px; cursor: pointer;
          transition: background 0.15s; white-space: nowrap;
        }
        .btn-view-full:hover { background: #ecfdf5; border-color: #a7f3d0; }
        .wl-search-full { flex: 1 1 100%; min-width: 0; }
        /* Make search dropdown open upward since search is at the bottom */
        .wl-add-stock .ss-dropdown {
          top: auto;
          bottom: calc(100% + 6px);
          z-index: 300;
          min-width: 300px;
        }

        /* Empty / loading states */
        .wl-center-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          color: #d1d5db;
        }
        .wl-center-state p { font-size: 0.8rem; color: #9ca3af; }
        .wl-center-state .wl-create-hint {
          font-size: 0.72rem;
          color: #6b7280;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.3rem 0.75rem;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          transition: background 0.12s;
        }
        .wl-center-state .wl-create-hint:hover { background: #ecfdf5; border-color: #059669; color: #059669; }
      `}</style>

      <div className="wl-page">
        {/* ── Left sidebar ── */}
        <div className="wl-list">

          {/* Watchlist selector */}
          <div className="wl-selector-wrap" ref={menuRef}>
            {editingName ? (
              <div className="wl-inline-form">
                <input
                  className="wl-inline-input"
                  value={editNameVal}
                  onChange={e => setEditNameVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleRenameWL()
                    if (e.key === "Escape") setEditingName(false)
                  }}
                  autoFocus
                />
                <button className="wl-inline-confirm" onClick={handleRenameWL}>✓</button>
                <button className="wl-inline-cancel" onClick={() => setEditingName(false)}>✕</button>
              </div>
            ) : (
              <div className="wl-selector-row">
                <button
                  className="wl-selector-btn"
                  onClick={() => setShowWLMenu(v => !v)}
                >
                  <span className="wl-selector-name">
                    {selectedWL ? selectedWL.name : "No watchlist"}
                  </span>
                  <svg
                    className={`wl-selector-arrow ${showWLMenu ? "open" : ""}`}
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {selectedWL && (
                  <button
                    className="wl-icon-btn"
                    title="Rename"
                    onClick={() => { setEditNameVal(selectedWL.name); setEditingName(true); setShowWLMenu(false) }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}

                {selectedWL && (
                  <button
                    className="wl-icon-btn danger"
                    title="Delete watchlist"
                    onClick={() => { handleDeleteWL(); setShowWLMenu(false) }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                )}

                <button
                  className="wl-icon-btn add"
                  title="New watchlist"
                  onClick={() => { setCreatingWL(true); setShowWLMenu(false) }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Watchlist dropdown */}
            {showWLMenu && watchlists.length > 0 && (
              <div className="wl-dropdown">
                {watchlists.map(wl => (
                  <button
                    key={wl.id}
                    className={`wl-dropdown-item ${selectedWL?.id === wl.id ? "active" : ""}`}
                    onClick={() => { setSelectedWL(wl); setSelectedTicker(null); setShowWLMenu(false) }}
                  >
                    {wl.name}
                  </button>
                ))}
              </div>
            )}

            {/* Create watchlist inline form */}
            {creatingWL && (
              <div className="wl-inline-form">
                <input
                  className="wl-inline-input"
                  placeholder="Watchlist name..."
                  value={newWLName}
                  onChange={e => setNewWLName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleCreateWL()
                    if (e.key === "Escape") { setCreatingWL(false); setNewWLName("") }
                  }}
                  autoFocus
                />
                <button className="wl-inline-confirm" onClick={handleCreateWL}>✓</button>
                <button className="wl-inline-cancel" onClick={() => { setCreatingWL(false); setNewWLName("") }}>✕</button>
              </div>
            )}
          </div>

          {/* Stock count */}
          <div className="wl-list-header">
            {selectedWL
              ? `${selectedWL.name} · ${activeStocks.length}`
              : "No watchlist selected"}
          </div>

          {/* Stock list */}
          <div className="wl-list-body">
            {loading ? (
              <div className="wl-empty-msg">Loading...</div>
            ) : error ? (
              <div className="wl-empty-msg">{error}</div>
            ) : !selectedWL ? (
              <div className="wl-empty-msg">Create a watchlist to begin</div>
            ) : activeStocks.length === 0 ? (
              <div className="wl-empty-msg">No stocks yet — search below to add</div>
            ) : (
              activeStocks.map(stock => {
                const md = marketData[stock.stock_ticker] || marketData[stock.stock_ticker?.split(".")[0]] || {}
                return (
                  <div
                    key={stock.id}
                    className={`wl-stock-row ${selectedTicker === stock.stock_ticker ? "active" : ""}`}
                    onClick={() => navigate(`/stock/${stock.stock_ticker}`)}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="wl-row-sym">{stock.stock_ticker}</div>
                      {md.company_name && (
                        <div style={{ fontSize: "0.62rem", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {md.company_name}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                      {md.price != null && (
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", fontWeight: 600, color: "#111827" }}>
                          ₹{Number(md.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      )}
                      <button
                        className="wl-row-del"
                        title="Remove"
                        onClick={e => { e.stopPropagation(); handleRemoveStock(stock) }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Add stock via search */}
          {selectedWL && (
            <div className="wl-add-stock">
              <StockSearch
                onSelect={handleSearchAddStock}
                placeholder="Search to add stock…"
                className="wl-search-full"
              />
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        {selectedTicker ? (
          <StockDetail
            ticker={selectedTicker}
            marketData={marketData[selectedTicker] || marketData[selectedTicker?.split(".")[0]] || {}}
            onViewFull={() => navigate(`/stock/${selectedTicker}`)}
          />
        ) : (
          <div className="wl-center-state">
            {!loading && watchlists.length === 0 ? (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                <p>No watchlists yet</p>
                <button
                  className="wl-create-hint"
                  onClick={() => setCreatingWL(true)}
                >
                  + Create your first watchlist
                </button>
              </>
            ) : (
              <>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <p>Select a stock to view details</p>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
