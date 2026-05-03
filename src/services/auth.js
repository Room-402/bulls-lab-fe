import { apiRequest } from "./api"

export function loginUser(data) {
  return apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function registerUser(data) {
  return apiRequest("/users/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
