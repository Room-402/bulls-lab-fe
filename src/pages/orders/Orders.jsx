import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Outlet, Navigate } from "react-router-dom"

const ORDER_TABS = [
  { label: "Open Orders",   to: "/orders/open" },
  { label: "Order History", to: "/orders/history" },
  { label: "Stock SIP",     to: "/orders/sip" },
  { label: "GTT",           to: "/orders/gtt" },
  { label: "Basket Orders", to: "/orders/basket" },
  { label: "Alerts",        to: "/orders/alerts" },
]

function OrdersSubNav() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&display=swap');

        .orders-subnav {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          padding: 0 2rem;
          height: 42px;
          gap: 0.15rem;
          position: sticky;
          top: 56px;
          z-index: 90;
        }

        .subnav-link {
          font-family: 'Syne', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-decoration: none;
          padding: 0.3rem 0.9rem;
          border-radius: 5px;
          letter-spacing: 0.01em;
          white-space: nowrap;
          transition: color 0.15s, background 0.15s;
          position: relative;
        }

        .subnav-link:hover {
          color: #111827;
          background: #f3f4f6;
        }

        .subnav-link.active {
          color: #059669;
          background: #ecfdf5;
        }

        .subnav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0.9rem;
          right: 0.9rem;
          height: 2px;
          background: #059669;
          border-radius: 2px 2px 0 0;
        }

        .orders-content {
          padding: 2rem;
          color: #111827;
          font-family: 'Syne', sans-serif;
          background: #f9fafb;
          min-height: calc(100vh - 98px);
        }

        .orders-content h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 40vh;
          color: #d1d5db;
          gap: 0.75rem;
        }

        .empty-state p {
          font-size: 0.85rem;
          letter-spacing: 0.03em;
          color: #9ca3af;
        }
      `}</style>

      <div className="orders-subnav">
        {ORDER_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `subnav-link${isActive ? " active" : ""}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </>
  )
}

function EmptyState({ label }) {
  return (
    <div className="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h4" />
      </svg>
      <p>No {label} yet</p>
    </div>
  )
}

export function OpenOrders()   { return <div className="orders-content"><h2>Open Orders</h2><EmptyState label="open orders" /></div> }
export function OrderHistory() { return <div className="orders-content"><h2>Order History</h2><EmptyState label="order history" /></div> }
export function StockSIP()     { return <div className="orders-content"><h2>Stock SIP</h2><EmptyState label="SIPs" /></div> }
export function GTT()          { return <div className="orders-content"><h2>GTT Orders</h2><EmptyState label="GTT orders" /></div> }
export function BasketOrders() { return <div className="orders-content"><h2>Basket Orders</h2><EmptyState label="basket orders" /></div> }
export function Alerts()       { return <div className="orders-content"><h2>Alerts</h2><EmptyState label="alerts" /></div> }

export default function Orders() {
  return (
    <>
      <OrdersSubNav />
      <Outlet />
    </>
  )
}