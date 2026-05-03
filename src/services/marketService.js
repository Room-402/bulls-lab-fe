import axios from "axios"

/**
 * Market Service — dedicated axios instance.
 *
 * Base URL is driven by the VITE_MARKET_SERVICE_URL env var so it can differ
 * across local / staging / production without code changes.
 */
const MARKET_SERVICE_URL =
  import.meta.env.VITE_MARKET_SERVICE_URL || "http://127.0.0.1:8000/api/v1"

const marketApi = axios.create({
  baseURL: MARKET_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
})

/**
 * Search stocks by a text query.
 * GET /stocks/search?query=<query>
 *
 * @param {string} query — e.g. "tata"
 * @returns {Promise<Array<{ticker: string, company_name: string, exchange: string}>>}
 */
export async function searchStocks(query) {
  const { data } = await marketApi.get("/stocks/search", {
    params: { query },
  })
  return data.items ?? []
}

/**
 * Get full details for a single stock.
 * GET /stocks/get_stock_details?symbol=<symbol>
 *
 * @param {string} symbol — e.g. "TCS"
 * @returns {Promise<Object>} — the stock_details object
 */
export async function getStockDetails(symbol) {
  const { data } = await marketApi.get("/stocks/get_stock_details", {
    params: { symbol },
  })
  return data.stock_details ?? null
}

/**
 * Get details for multiple stocks in a single call.
 * GET /stocks/get_stock_details_batch?symbols=TCS,RELIANCE,INFY
 *
 * @param {string[]} symbols — e.g. ["TCS", "RELIANCE"]
 * @returns {Promise<Object>} — map of symbol → { symbol, price, day_high, day_low, company_name }
 */
export async function getStockDetailsBatch(symbols) {
  if (!symbols || symbols.length === 0) return {}
  const { data } = await marketApi.get("/stocks/get_stock_details_batch", {
    params: { symbols },
    paramsSerializer: { indexes: null },
  })
  return data.stock_details ?? {}
}

/**
 * Get historical price data for charting.
 * GET /stocks/history?symbol=<symbol>&period=<period>&interval=<interval>
 */
export async function getStockHistory(symbol, period, interval) {
  const { data } = await marketApi.get("/stocks/history", {
    params: { symbol, period, interval },
  })
  return data.history ?? []
}

export default marketApi
