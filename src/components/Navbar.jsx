import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { localStorageService } from "@/services/localStorageService"

const INDICES = [
  { name: "NIFTY",  value: "25,571.25", change: "+116.90", changePct: "+0.46%", positive: true },
  { name: "SENSEX", value: "84,814.71", change: "+316.57", changePct: "+0.38%", positive: true },
]

const NAV_LINKS = [
  { label: "Markets",   to: "/markets" },
  { label: "Watchlist", to: "/watchlist" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Orders",    to: "/orders" },
  { label: "Positions", to: "/positions" },
  { label: "Tools",     to: "/tools" },
]

/* Replace with real user from auth context / API */
const MOCK_USER = { initials: "ML", name: "Luffy" }

export default function Navbar() {
  const navigate  = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

        .navbar {
          font-family: 'Syne', sans-serif;
          background: #ffffff; border-bottom: 1px solid #e5e7eb;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2rem; height: 56px;
          position: sticky; top: 0; z-index: 100;
          gap: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .navbar-brand {
          font-size: 1.15rem; font-weight: 700; color: #111827;
          letter-spacing: -0.02em; white-space: nowrap;
          text-decoration: none; display: flex; align-items: center;
        }
        .navbar-brand span { color: #059669; }
        .navbar-indices {
          display: flex; align-items: center; gap: 1.5rem;
          border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;
          padding: 0 1.5rem; height: 100%; flex-shrink: 0;
        }
        .index-item  { display: flex; flex-direction: column; line-height: 1.25; }
        .index-name  { font-family:'DM Mono',monospace; font-size:0.58rem; color:#9ca3af; letter-spacing:0.1em; text-transform:uppercase; }
        .index-value { font-family:'DM Mono',monospace; font-size:0.8rem; font-weight:500; color:#111827; }
        .index-change{ font-family:'DM Mono',monospace; font-size:0.67rem; }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .navbar-links { display:flex; align-items:center; gap:0.15rem; flex:1; }
        .nav-link {
          font-size:0.78rem; font-weight:600; color:#6b7280;
          text-decoration:none; padding:0.3rem 0.7rem; border-radius:6px;
          transition:color 0.15s,background 0.15s; white-space:nowrap;
        }
        .nav-link:hover  { color:#111827; background:#f3f4f6; }
        .nav-link.active { color:#059669; background:#ecfdf5; }
        .navbar-actions  { display:flex; align-items:center; gap:0.75rem; flex-shrink:0; }

        /* Live dot */
        .live-badge { display:flex; align-items:center; gap:0.35rem; font-family:'DM Mono',monospace; font-size:0.6rem; color:#059669; letter-spacing:0.08em; }
        .live-dot   { width:6px; height:6px; border-radius:50%; background:#059669; animation:nbpulse 1.8s infinite; }
        @keyframes nbpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.7)} }

        /* Account nav button */
        .btn-account {
          font-family:'Syne',sans-serif; display:flex; align-items:center; gap:0.4rem;
          font-size:0.72rem; font-weight:700; letter-spacing:0.02em;
          background:#ecfdf5; color:#059669; border:1px solid #a7f3d0;
          padding:0.28rem 0.75rem 0.28rem 0.35rem;
          border-radius:20px; cursor:pointer; text-decoration:none;
          transition:background 0.15s;
        }
        .btn-account:hover  { background:#d1fae5; }
        .btn-account.active { background:#d1fae5; border-color:#6ee7b7; }
        .btn-account-av {
          width:24px; height:24px; border-radius:50%; background:#059669; color:#fff;
          display:flex; align-items:center; justify-content:center;
          font-size:0.6rem; font-weight:700; flex-shrink:0;
        }

        .hamburger { display:none; background:none; border:none; cursor:pointer; color:#374151; padding:0.25rem; }

        @media (max-width:900px) {
          .navbar-links,.navbar-indices { display:none; }
          .hamburger { display:flex; }
          .mobile-menu {
            position:absolute; top:56px; left:0; right:0;
            background:#fff; border-bottom:1px solid #e5e7eb;
            padding:0.75rem 1.5rem 1rem; display:flex; flex-direction:column; gap:0.2rem;
            z-index:99; box-shadow:0 4px 12px rgba(0,0,0,0.08);
          }
          .mobile-menu .nav-link { padding:0.5rem 0.75rem; font-size:0.9rem; }
        }
      `}</style>

      <nav className="navbar">
        <NavLink to="/markets" className="navbar-brand">Bulls<span>Lab</span></NavLink>

        <div className="navbar-indices">
          {INDICES.map(idx => (
            <div key={idx.name} className="index-item">
              <span className="index-name">{idx.name}</span>
              <span className="index-value">{idx.value}</span>
              <span className={`index-change ${idx.positive ? "positive" : "negative"}`}>
                {idx.change} ({idx.changePct})
              </span>
            </div>
          ))}
        </div>

        <div className="navbar-links">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="live-badge"><div className="live-dot" />LIVE</div>

          <NavLink to="/account"
            className={({ isActive }) => `btn-account${isActive ? " active" : ""}`}>
            <div className="btn-account-av">{MOCK_USER.initials}</div>
            Account
          </NavLink>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}