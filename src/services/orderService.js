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
