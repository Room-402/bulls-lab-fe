import { apiRequest } from "./api"

/**
 * Create a new order.
 * POST /orders/create
 *
 * @param {Object} data - The CreateOrderRequest payload.
 */
export async function createOrder(data) {
  return apiRequest("/orders/create", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Get orders by tab.
 * GET /orders?tab={tab}
 *
 * @param {string} tab - The tab name (e.g., 'open', 'history', 'gtt', 'positions').
 */
export async function getOrdersByTab(tab = 'open') {
  return apiRequest(`/orders?tab=${tab}`, {
    method: "GET",
  })
}
