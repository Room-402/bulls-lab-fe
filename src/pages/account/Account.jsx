import { useState } from "react"
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom"

/* ─── MOCK DATA — swap with API calls ────────────────────────────────────── */
export const MOCK_USER = {
  initials:    "ML",
  name:        "Monkey D Luffy",
  email:       "luffym@example.com",
  phone:       "+91 98765 41234",
  memberSince: "2021",
  balance:     5373.23,
  pan:         "ABCDE1234F",
  dob:         "15 May 1995",
  segment:     "Equity, F&O, Currency",
  broker:      "Bulls Lab",
  demat:       "IN301234567890",
}

const REPORT_LINKS = [
  { label: "Trades & Charges",  href: "#", badge: null },
  { label: "Statements",        href: "#", badge: null },
  { label: "Profit & Loss",     href: "#", badge: null },
  { label: "Trading Insights",  href: "#", badge: "NEW" },
]

const PLEDGING_LINKS = [
  { label: "Pledge Holdings for Extra Margin", href: "#", desc: "Pledge your holdings to get extra margin for trading" },
  { label: "MTF",     href: "#", desc: "Buy up to 4x qty of equity stocks at just 0.041% interest/day" },
  { label: "Transfer Stocks", href: "#", desc: "Transfer stocks to any Demat account quickly and securely" },
]

const INCENTIVE_LINKS = [
  { label: "Offers & Rewards",   href: "#", desc: "Save more with special offers for you" },
  { label: "Refer & Earn",       href: "#", desc: "Refer a friend to join & get rewarded ₹2000" },
  { label: "Subscription Plans", href: "#", desc: "Curated plans to help you save on trading charges" },
]

const ACCOUNT_LINKS = [
  { label: "Subscription Plans",   href: "#" },
  { label: "Keyboard & Shortcuts", href: "#" },
  { label: "About Us",             href: "#" },
]

const SOCIAL_LINKS = [
  { label: "Twitter / X",  href: "#", icon: "𝕏" },
  { label: "Instagram",    href: "#", icon: "◉" },
  { label: "YouTube",      href: "#", icon: "▶" },
  { label: "LinkedIn",     href: "#", icon: "in" },
]

/* ─── SHARED SMALL COMPONENTS ────────────────────────────────────────────── */

function PageWrap({ children }) {
  return <div className="acc-page-wrap">{children}</div>
}

function Card({ children, style }) {
  return <div className="acc-card" style={style}>{children}</div>
}

function CardTitle({ children }) {
  return <div className="acc-card-title">{children}</div>
}

function SectionLabel({ children }) {
  return <div className="acc-section-label">{children}</div>
}

function KVRow({ label, value }) {
  return (
    <div className="acc-kv-row">
      <span className="acc-kv-key">{label}</span>
      <span className="acc-kv-val">{value}</span>
    </div>
  )
}

function LinkRow({ label, desc, badge, href }) {
  return (
    <a className="acc-link-row" href={href}>
      <div className="acc-link-left">
        <span className="acc-link-label">{label}</span>
        {desc && <span className="acc-link-desc">{desc}</span>}
      </div>
      {badge && <span className="acc-badge">{badge}</span>}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </a>
  )
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="acc-toggle-group">
      {options.map(o => (
        <button key={o} className={`acc-toggle-btn ${value === o ? "active" : ""}`} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  )
}

function SwitchRow({ label, desc, value, onChange }) {
  return (
    <div className="acc-switch-row">
      <div>
        <div className="acc-switch-label">{label}</div>
        {desc && <div className="acc-link-desc">{desc}</div>}
      </div>
      <button className={`acc-switch ${value ? "on" : ""}`} onClick={() => onChange(!value)}>
        <div className="acc-switch-thumb" />
      </button>
    </div>
  )
}

/* ─── TAB PAGES ──────────────────────────────────────────────────────────── */

/** Overview tab */
function AccountOverview({ user, onLogout }) {
  return (
    <PageWrap>
      {/* Profile card */}
      <div className="acc-profile-card">
        <div className="acc-profile-avatar">{user.initials}</div>
        <div className="acc-profile-info">
          <div className="acc-profile-name">{user.name}</div>
          <div className="acc-profile-meta">Member since {user.memberSince}</div>
          <div className="acc-profile-meta">{user.email}</div>
        </div>
        <a href="/account/profile" className="acc-profile-edit-btn">Edit Profile</a>
      </div>

      {/* Balance */}
      <Card>
        <CardTitle>Trading Balance</CardTitle>
        <div className="acc-balance-row">
          <div>
            <div className="acc-balance-amount">
              ₹ {user.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="acc-balance-links">
              <a href="#" className="acc-balance-link">View Balance Summary</a>
              <span style={{ color: "#d1d5db" }}>·</span>
              <a href="#" className="acc-balance-link">Transaction Summary</a>
            </div>
          </div>
          <div className="acc-balance-btns">
            <button className="acc-btn-withdraw">Withdraw</button>
            <button className="acc-btn-add">Add Funds</button>
          </div>
        </div>
      </Card>

      {/* Account details */}
      <Card>
        <CardTitle>Account Details</CardTitle>
        <KVRow label="PAN"         value={user.pan} />
        <KVRow label="Date of Birth" value={user.dob} />
        <KVRow label="Phone"       value={user.phone} />
        <KVRow label="Segments"    value={user.segment} />
        <KVRow label="Demat No."   value={user.demat} />
        <KVRow label="Broker"      value={user.broker} />
      </Card>

      {/* Logout */}
      <button className="acc-logout-btn" onClick={onLogout}>Logout</button>
    </PageWrap>
  )
}

/** Reports tab */
function AccountReports() {
  return (
    <PageWrap>
      <SectionLabel>Reports</SectionLabel>
      <Card>
        {REPORT_LINKS.map(l => <LinkRow key={l.label} {...l} />)}
      </Card>

      <SectionLabel style={{ marginTop: "1.25rem" }}>Pledging &amp; Pay Later</SectionLabel>
      <Card>
        {PLEDGING_LINKS.map(l => <LinkRow key={l.label} {...l} />)}
      </Card>
    </PageWrap>
  )
}

/** Incentives tab */
function AccountIncentives() {
  return (
    <PageWrap>
      <SectionLabel>Financial Incentives</SectionLabel>

      <div className="acc-incentive-grid">
        {INCENTIVE_LINKS.map(l => (
          <a key={l.label} className="acc-incentive-card" href={l.href}>
            <div className="acc-incentive-icon">
              {l.label === "Offers & Rewards" ? "🎁" : l.label === "Refer & Earn" ? "👥" : "📋"}
            </div>
            <div className="acc-incentive-label">{l.label}</div>
            <div className="acc-link-desc">{l.desc}</div>
          </a>
        ))}
      </div>
    </PageWrap>
  )
}

/** Settings tab */
function AccountSettings() {
  const [fontSize,      setFontSize]      = useState("Medium")
  const [theme,         setTheme]         = useState("Light")
  const [accessibility, setAccessibility] = useState(false)
  const [reconfirm,     setReconfirm]     = useState(false)

  return (
    <PageWrap>
      <SectionLabel>Quick Settings</SectionLabel>
      <Card>
        <div className="acc-setting-block">
          <div className="acc-setting-name">Font Size</div>
          <div className="acc-link-desc" style={{ marginBottom: "0.6rem" }}>Customise your font size as per readability</div>
          <ToggleGroup options={["Small", "Medium", "Large"]} value={fontSize} onChange={setFontSize} />
        </div>
        <div className="acc-divider" />
        <div className="acc-setting-block">
          <div className="acc-setting-name">Appearance Preference</div>
          <div className="acc-link-desc" style={{ marginBottom: "0.6rem" }}>Choose your theme</div>
          <ToggleGroup options={["Light", "Dark", "System"]} value={theme} onChange={setTheme} />
        </div>
        <div className="acc-divider" />
        <SwitchRow
          label="Enable Accessibility Mode"
          desc="Turning this on will disable all shortcuts"
          value={accessibility}
          onChange={setAccessibility}
        />
        <div className="acc-divider" />
        <SwitchRow
          label="Re-Confirm Order"
          desc="Show an order preview every time you place an order"
          value={reconfirm}
          onChange={setReconfirm}
        />
      </Card>

      <SectionLabel style={{ marginTop: "1.25rem" }}>Account Settings &amp; Other Info</SectionLabel>
      <Card>
        {ACCOUNT_LINKS.map(l => <LinkRow key={l.label} {...l} />)}
      </Card>

      <SectionLabel style={{ marginTop: "1.25rem" }}>Support</SectionLabel>
      <Card style={{ padding: "1.25rem" }}>
        <div className="acc-support-block">
          <div>
            <div className="acc-setting-name">Your all-in-one place for help and support</div>
            <div className="acc-link-desc">Got some queries? Let the bot help with your questions!</div>
          </div>
          <button className="acc-btn-add">ASK BOT</button>
        </div>
      </Card>

      <SectionLabel style={{ marginTop: "1.25rem" }}>Join our Community</SectionLabel>
      <Card style={{ padding: "1rem 1.25rem" }}>
        <div className="acc-social-row">
          {SOCIAL_LINKS.map(s => (
            <a key={s.label} className="acc-social-btn" href={s.href} title={s.label}>
              {s.icon}
            </a>
          ))}
        </div>
      </Card>
    </PageWrap>
  )
}

/* ─── CSS ────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@500;600;700&display=swap');

/* Sub nav */
.acc-subnav {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  padding: 0 2rem;
  position: sticky;
  top: 56px;
  z-index: 80;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow-x: auto;
  scrollbar-width: none;
}
.acc-subnav::-webkit-scrollbar { display: none; }
.acc-tab {
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem; font-weight: 600; color: #6b7280;
  text-decoration: none; white-space: nowrap;
  padding: 0.78rem 1.1rem;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: 0.02em; background: none; border-top: none;
  border-left: none; border-right: none; cursor: pointer;
}
.acc-tab:hover  { color: #111827; }
.acc-tab.active { color: #059669; border-bottom-color: #059669; }

/* Page wrap */
.acc-page-wrap {
  background: #f9fafb;
  min-height: calc(100vh - 98px);
  padding: 1.5rem 2rem 3rem;
  font-family: 'Syne', sans-serif;
  max-width: 760px;
}

/* Profile hero card */
.acc-profile-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.acc-profile-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: #059669; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 700; flex-shrink: 0;
}
.acc-profile-info { flex: 1; min-width: 0; }
.acc-profile-name { font-size: 0.95rem; font-weight: 700; color: #111827; }
.acc-profile-meta { font-size: 0.72rem; color: #9ca3af; margin-top: 0.15rem; }
.acc-profile-edit-btn {
  font-family: 'Syne', sans-serif;
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
  padding: 0.35rem 0.85rem; border-radius: 6px;
  background: #ecfdf5; color: #059669;
  border: 1px solid #a7f3d0; text-decoration: none;
  transition: background 0.15s; flex-shrink: 0;
}
.acc-profile-edit-btn:hover { background: #d1fae5; }

/* Cards */
.acc-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.acc-card-title {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #9ca3af;
  padding: 0.85rem 1.25rem 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

/* Section label */
.acc-section-label {
  font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: #9ca3af;
  margin-bottom: 0.5rem; margin-top: 0.25rem;
  padding: 0 0.1rem;
}

/* KV rows */
.acc-kv-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.6rem 1.25rem; border-bottom: 1px solid #f9fafb; gap: 1rem;
}
.acc-kv-row:last-child { border-bottom: none; }
.acc-kv-key { font-size: 0.73rem; color: #6b7280; }
.acc-kv-val { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #111827; text-align: right; }

/* Balance */
.acc-balance-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.85rem 1.25rem; gap: 1rem; flex-wrap: wrap;
}
.acc-balance-amount {
  font-family: 'DM Mono', monospace;
  font-size: 1.5rem; font-weight: 500; color: #111827; line-height: 1;
}
.acc-balance-links { display: flex; gap: 0.5rem; margin-top: 0.4rem; align-items: center; }
.acc-balance-link  { font-size: 0.67rem; color: #059669; text-decoration: underline; cursor: pointer; }
.acc-balance-btns  { display: flex; gap: 0.5rem; }
.acc-btn-withdraw {
  font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700;
  padding: 0.38rem 0.85rem; border-radius: 6px; cursor: pointer;
  background: #fff; color: #6b7280; border: 1px solid #e5e7eb;
  transition: all 0.15s;
}
.acc-btn-withdraw:hover { border-color: #9ca3af; color: #374151; }
.acc-btn-add {
  font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700;
  padding: 0.38rem 0.85rem; border-radius: 6px; cursor: pointer;
  background: #059669; color: #fff; border: none;
  transition: opacity 0.15s;
}
.acc-btn-add:hover { opacity: 0.88; }

/* Link rows */
.acc-link-row {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.7rem 1.25rem; border-bottom: 1px solid #f9fafb;
  text-decoration: none; cursor: pointer; transition: background 0.12s;
}
.acc-link-row:last-child { border-bottom: none; }
.acc-link-row:hover { background: #f9fafb; }
.acc-link-left { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 0.1rem; }
.acc-link-label { font-size: 0.78rem; font-weight: 600; color: #111827; }
.acc-link-desc  { font-size: 0.67rem; color: #9ca3af; line-height: 1.4; }
.acc-badge {
  font-size: 0.55rem; font-weight: 700; letter-spacing: 0.08em;
  background: #059669; color: #fff; padding: 0.15rem 0.4rem; border-radius: 3px; flex-shrink: 0;
}

/* Incentive grid */
.acc-incentive-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;
}
@media (max-width: 600px) { .acc-incentive-grid { grid-template-columns: 1fr; } }
.acc-incentive-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
  padding: 1.1rem; text-decoration: none; display: flex; flex-direction: column; gap: 0.4rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: box-shadow 0.15s, border-color 0.15s;
}
.acc-incentive-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-color: #a7f3d0; }
.acc-incentive-icon { font-size: 1.4rem; }
.acc-incentive-label { font-size: 0.82rem; font-weight: 700; color: #111827; }

/* Settings */
.acc-setting-block { padding: 0.85rem 1.25rem; }
.acc-setting-name  { font-size: 0.78rem; font-weight: 600; color: #111827; margin-bottom: 0.1rem; }
.acc-divider       { height: 1px; background: #f3f4f6; }

/* Toggle group */
.acc-toggle-group { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.acc-toggle-btn {
  font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 600;
  padding: 0.3rem 0.85rem; border-radius: 6px; cursor: pointer;
  border: 1px solid #e5e7eb; background: #fff; color: #6b7280;
  transition: all 0.12s;
}
.acc-toggle-btn.active { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
.acc-toggle-btn:hover:not(.active) { background: #f9fafb; }

/* Switch row */
.acc-switch-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.25rem; gap: 1rem;
}
.acc-switch-label { font-size: 0.78rem; font-weight: 600; color: #111827; }
.acc-switch {
  width: 38px; height: 22px; border-radius: 11px;
  background: #e5e7eb; border: none; cursor: pointer;
  position: relative; transition: background 0.2s; flex-shrink: 0; padding: 0;
}
.acc-switch.on { background: #059669; }
.acc-switch-thumb {
  position: absolute; top: 4px; left: 4px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.acc-switch.on .acc-switch-thumb { transform: translateX(16px); }

/* Support */
.acc-support-block { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

/* Social */
.acc-social-row  { display: flex; gap: 0.5rem; }
.acc-social-btn  {
  width: 36px; height: 36px; border-radius: 8px;
  background: #f9fafb; border: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; color: #374151;
  text-decoration: none; transition: all 0.15s;
}
.acc-social-btn:hover { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }

/* Logout */
.acc-logout-btn {
  font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.06em; padding: 0.6rem 1.5rem;
  background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
  border-radius: 8px; cursor: pointer; transition: background 0.15s;
  margin-top: 0.5rem;
}
.acc-logout-btn:hover { background: #fee2e2; }
`

/* ─── ACCOUNT LAYOUT ─────────────────────────────────────────────────────── */
export default function Account() {
  const navigate  = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  const TABS = [
    { label: "Overview",   to: "/account/overview"   },
    { label: "Reports",    to: "/account/reports"    },
    { label: "Incentives", to: "/account/incentives" },
    { label: "Settings",   to: "/account/settings"   },
  ]

  return (
    <>
      <style>{CSS}</style>

      {/* Sub nav */}
      <div className="acc-subnav">
        {TABS.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `acc-tab${isActive ? " active" : ""}`}
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      {/* Routed content */}
      <Outlet context={{ user: MOCK_USER, onLogout: handleLogout }} />
    </>
  )
}

/* Named exports for each sub-page — used in App.jsx routes */
export {
  AccountOverview,
  AccountReports,
  AccountIncentives,
  AccountSettings,
}