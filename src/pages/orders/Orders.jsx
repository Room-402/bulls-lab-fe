import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Outlet, Navigate } from "react-router-dom"
import { getOrdersByTab } from "../../services/orderService"
import { SkeletonRow, skeletonCSS } from "../../components/Skeleton"

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

        ${skeletonCSS}
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

        .order-table-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .order-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .order-table th {
          text-align: left;
          padding: 0.8rem 1rem;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
        }

        .order-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          color: #111827;
          font-family: 'DM Mono', monospace;
        }

        .order-table tr:last-child td {
          border-bottom: none;
        }

        .order-table tr:hover td {
          background: #f9fafb;
        }

        .badge {
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .badge.buy { background: #ecfdf5; color: #059669; }
        .badge.sell { background: #fef2f2; color: #dc2626; }
        .badge.pending { background: #fffbeb; color: #d97706; }
        .badge.executed { background: #ecfdf5; color: #059669; }
        .badge.cancelled { background: #f3f4f6; color: #6b7280; }
        
        .stock-name-col { font-family: 'Syne', sans-serif; font-weight: 700; }
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

function OrderList({ tabName, title }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await getOrdersByTab(tabName);
        setOrders(response.data?.data || []);
      } catch (error) {
        console.error(`Failed to fetch ${tabName} orders:`, error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [tabName]);

  return (
    <div className="orders-content">
      <h2>{title}</h2>
      {loading ? (
        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Time</th><th>Type</th><th>Instrument</th><th>Product</th><th>Qty</th><th>Avg. Price</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)}
            </tbody>
          </table>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState label={title.toLowerCase()} />
      ) : (
        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Instrument</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Avg. Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id || idx}>
                  <td style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                  </td>
                  <td>
                    <span className={`badge ${order.order_type?.toLowerCase()}`}>
                      {order.order_type}
                    </span>
                  </td>
                  <td className="stock-name-col">{order.stock_ticker}</td>
                  <td>{order.product_type} <span style={{ fontSize: "0.6rem", color: "#9ca3af", marginLeft: "4px" }}>{order.execution_type}</span></td>
                  <td>{order.quantity}</td>
                  <td>₹{order.price ? order.price.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : '0.00'}</td>
                  <td>
                    <span className={`badge ${((order.order_status || order.status) || '').toLowerCase()}`}>
                      {order.order_status || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function OpenOrders()   { return <OrderList tabName="open" title="Open Orders" /> }
export function OrderHistory() { return <OrderList tabName="history" title="Order History" /> }
export function StockSIP()     { return <div className="orders-content"><h2>Stock SIP</h2><EmptyState label="SIPs" /></div> }
export function GTT()          { return <OrderList tabName="gtt" title="GTT Orders" /> }
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