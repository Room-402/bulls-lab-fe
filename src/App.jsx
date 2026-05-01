import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from "react-router-dom"

import Login from "./pages/login/Login.jsx"
import Register from "./pages/register/Register.jsx"
import Navbar from "./components/Navbar.jsx"

import Orders, { OpenOrders, OrderHistory, StockSIP, GTT, BasketOrders, Alerts } from "./pages/orders/Orders.jsx"
import Portfolio, { PortfolioOverview, PortfolioEquity } from "./pages/portfolio/Portfolio.jsx"
import Watchlist from "./pages/watchlist/Watchlist.jsx"
import Account, { AccountOverview, AccountReports, AccountIncentives, AccountSettings } from "./pages/account/Account.jsx"
import StockDetails from "./pages/stock/StockDetails.jsx"

const Page = ({ name }) => (
  <div style={{ padding: "2rem", color: "#111827", fontFamily: "sans-serif", background: "#f9fafb", minHeight: "calc(100vh - 56px)" }}>
    {name} page
  </div>
)

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

/* Wrapper so outlet context (user, onLogout) flows into sub-pages */
function AccountOverviewPage() {
  const { user, onLogout } = useOutletContext()
  return <AccountOverview user={user} onLogout={onLogout} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* App */}
        <Route path="/stock/:symbol" element={<AppLayout><StockDetails /></AppLayout>} />
        <Route path="/markets"   element={<AppLayout><Page name="Markets" /></AppLayout>} />
        <Route path="/watchlist" element={<AppLayout><Watchlist /></AppLayout>} />
        <Route path="/positions" element={<AppLayout><Page name="Positions" /></AppLayout>} />
        <Route path="/tools"     element={<AppLayout><Page name="Tools" /></AppLayout>} />

        {/* Portfolio */}
        <Route path="/portfolio" element={<AppLayout><Portfolio /></AppLayout>}>
          <Route index           element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<PortfolioOverview />} />
          <Route path="equity"   element={<PortfolioEquity />} />
        </Route>

        {/* Orders */}
        <Route path="/orders" element={<AppLayout><Orders /></AppLayout>}>
          <Route index          element={<Navigate to="open" replace />} />
          <Route path="open"    element={<OpenOrders />} />
          <Route path="history" element={<OrderHistory />} />
          <Route path="sip"     element={<StockSIP />} />
          <Route path="gtt"     element={<GTT />} />
          <Route path="basket"  element={<BasketOrders />} />
          <Route path="alerts"  element={<Alerts />} />
        </Route>

        {/* Account */}
        <Route path="/account" element={<AppLayout><Account /></AppLayout>}>
          <Route index              element={<Navigate to="overview" replace />} />
          <Route path="overview"    element={<AccountOverviewPage />} />
          <Route path="reports"     element={<AccountReports />} />
          <Route path="incentives"  element={<AccountIncentives />} />
          <Route path="settings"    element={<AccountSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App