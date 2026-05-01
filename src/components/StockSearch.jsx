import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { searchStocks } from "@/services/marketService"

/**
 * Extract the base symbol from a ticker string.
 * e.g. "TCS.NS" → "TCS", "RELIANCE.BO" → "RELIANCE"
 */
function extractSymbol(ticker) {
  return ticker.split(".")[0]
}

export default function StockSearch({ onSelect, placeholder, className }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef(null)
  const debounceRef = useRef(null)

  /* ── debounced search ── */
  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 1) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const items = await searchStocks(q.trim())
      setResults(items)
      setOpen(items.length > 0)
      setActiveIdx(-1)
    } catch {
      setResults([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  /* ── click‑outside to close ── */
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  /* ── keyboard nav ── */
  function handleKeyDown(e) {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx((i) => (i < results.length - 1 ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx((i) => (i > 0 ? i - 1 : results.length - 1))
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault()
      selectStock(results[activeIdx])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  function selectStock(item) {
    setQuery("")
    setOpen(false)
    setResults([])
    navigate(`/stock/${item.ticker}`)
  }

  function handleAdd(e, item) {
    e.stopPropagation()
    if (onSelect) onSelect(item)
  }

  return (
    <>
      <style>{`
        .ss-wrap {
          position: relative;
          flex: 0 1 320px;
          min-width: 180px;
        }
        .ss-input {
          width: 100%;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          padding: 0.38rem 0.75rem 0.38rem 2.1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          color: #111827;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ss-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.10);
          background: #fff;
        }
        .ss-input::placeholder { color: #9ca3af; }
        .ss-icon {
          position: absolute; left: 0.65rem; top: 50%; transform: translateY(-50%);
          color: #9ca3af; pointer-events: none;
        }
        .ss-spinner {
          position: absolute; right: 0.65rem; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; border: 2px solid #e5e7eb; border-top-color: #059669;
          border-radius: 50%; animation: ss-spin 0.6s linear infinite;
        }
        @keyframes ss-spin { to { transform: translateY(-50%) rotate(360deg); } }

        .ss-dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          max-height: 340px; overflow-y: auto; z-index: 200;
          padding: 0.35rem 0;
        }
        .ss-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.55rem 0.85rem; cursor: pointer;
          transition: background 0.12s;
        }
        .ss-item:hover, .ss-item.active { background: #ecfdf5; }
        .ss-item-left { display: flex; flex-direction: column; gap: 1px; }
        .ss-ticker {
          font-family: 'DM Mono', monospace; font-size: 0.8rem;
          font-weight: 600; color: #111827;
        }
        .ss-company {
          font-size: 0.7rem; color: #6b7280; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; max-width: 220px;
        }
        .ss-exchange {
          font-family: 'DM Mono', monospace; font-size: 0.6rem;
          color: #9ca3af; background: #f3f4f6; padding: 2px 6px;
          border-radius: 4px; flex-shrink: 0;
        }
        .ss-item-right { display: flex; align-items: center; gap: 6px; }
        .ss-add-btn {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 6px;
          background: #059669; color: #fff; border: none;
          cursor: pointer; flex-shrink: 0; transition: background 0.15s;
        }
        .ss-add-btn:hover { background: #047857; }
        .ss-added {
          font-size: 0.6rem; color: #059669; font-weight: 600;
        }
      `}</style>

      <div className={`ss-wrap ${className || ""}`} ref={wrapperRef}>
        {/* search icon */}
        <svg className="ss-icon" width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          id="global-stock-search"
          className="ss-input"
          type="text"
          placeholder={placeholder || "Search stocks… e.g. Tata, Reliance"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {loading && <div className="ss-spinner" />}

        {open && (
          <div className="ss-dropdown">
            {results.map((item, idx) => (
              <div
                key={item.ticker}
                className={`ss-item${idx === activeIdx ? " active" : ""}`}
                onClick={() => selectStock(item)}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <div className="ss-item-left">
                  <span className="ss-ticker">{item.ticker}</span>
                  <span className="ss-company">{item.company_name}</span>
                </div>
                <div className="ss-item-right">
                  <span className="ss-exchange">{item.exchange}</span>
                  {onSelect && (
                    <button className="ss-add-btn" title="Add to watchlist" onClick={(e) => handleAdd(e, item)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
