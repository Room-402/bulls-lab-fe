import { useState, useEffect } from "react"
import { getOrdersByTab } from "../../services/orderService"
import { getStockDetailsBatch } from "../../services/marketService"

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [marketPrices, setMarketPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      try {
        const response = await getOrdersByTab('positions');
        const posData = response.data?.data || [];
        setPositions(posData);
        
        if (posData.length > 0) {
          const symbols = [...new Set(posData.map(p => p.stock_ticker))].filter(Boolean);
          if (symbols.length > 0) {
            const prices = await getStockDetailsBatch(symbols);
            setMarketPrices(prices);
          }
        }
      } catch (error) {
        console.error("Failed to fetch positions:", error);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&display=swap');

        .positions-wrap {
          padding: 2rem;
          color: #111827;
          font-family: 'Syne', sans-serif;
          background: #f9fafb;
          min-height: calc(100vh - 56px);
        }

        .positions-wrap h2 {
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

        .pos-table-container {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .pos-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .pos-table th {
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

        .pos-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
          color: #111827;
          font-family: 'DM Mono', monospace;
        }

        .pos-table tr:last-child td {
          border-bottom: none;
        }

        .pos-table tr:hover td {
          background: #f9fafb;
        }
        
        .stock-name-col { font-family: 'Syne', sans-serif; font-weight: 700; }
        
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
        
        .green { color: #059669; }
        .red { color: #dc2626; }
        .gl-cell { display: flex; flex-direction: column; gap: 0.1rem; }
        .stat-sub { font-size: 0.7rem; }
      `}</style>

      <div className="positions-wrap">
        <h2>Positions</h2>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>Loading...</div>
        ) : positions.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6M9 12h6M9 15h4" />
            </svg>
            <p>No positions yet</p>
          </div>
        ) : (
          <div className="pos-table-container">
            <table className="pos-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Product</th>
                  <th>Side</th>
                  <th>Qty</th>
                  <th>Avg. Price</th>
                  <th>LTP</th>
                  <th>Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => {
                  const ltp = marketPrices[pos.stock_ticker]?.price || 0;
                  const inv = pos.price * pos.quantity;
                  const cur = ltp * pos.quantity;
                  const isBuy = pos.order_type === 'BUY';
                  const gl = isBuy ? (cur - inv) : (inv - cur);
                  const glPct = inv > 0 ? (gl / inv) * 100 : 0;
                  const isPositive = gl >= 0;

                  return (
                    <tr key={pos.id || idx}>
                      <td className="stock-name-col">{pos.stock_ticker}</td>
                      <td>{pos.product_type}</td>
                      <td>
                        <span className={`badge ${pos.order_type?.toLowerCase()}`}>
                          {pos.order_type}
                        </span>
                      </td>
                      <td>{pos.quantity}</td>
                      <td>₹{pos.price ? pos.price.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : '0.00'}</td>
                      <td>₹{ltp ? ltp.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : '0.00'}</td>
                      <td>
                        <div className="gl-cell">
                          <span className={isPositive ? "green" : "red"}>
                            {isPositive ? "+" : "-"}₹{Math.abs(gl).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </span>
                          <span className={`stat-sub ${isPositive ? "green" : "red"}`}>
                            {isPositive ? "+" : ""}{glPct.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
