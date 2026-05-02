import { apiRequest } from "./api"

export const portfolioService = {
  getHoldings: async () => {
    const res = await apiRequest("/portfolio/holdings")
    return res.data?.holdings || []
  }
}
