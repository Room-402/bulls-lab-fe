import { apiRequest } from "./api"

export function loginUser(data) {
  return apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
