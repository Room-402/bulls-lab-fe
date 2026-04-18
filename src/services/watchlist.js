import { apiRequest } from "./api"

export const watchlistService = {
  getAll: () =>
    apiRequest("/watchlists"),

  create: (name) =>
    apiRequest("/watchlists", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  update: (id, name) =>
    apiRequest(`/watchlists/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  remove: (id) =>
    apiRequest(`/watchlists/${id}`, { method: "DELETE" }),

  addStock: (id, stock_ticker) =>
    apiRequest(`/watchlists/${id}/stocks`, {
      method: "POST",
      body: JSON.stringify({ stock_ticker }),
    }),

  removeStock: (id, stock_ticker) =>
    apiRequest(`/watchlists/${id}/stocks`, {
      method: "DELETE",
      body: JSON.stringify({ stock_ticker }),
    }),
}
