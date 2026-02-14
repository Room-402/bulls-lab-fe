const TOKEN_KEY = "token"
const USER_KEY = "user"

export const localStorageService = {
  // TOKEN
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  
  setUserData(data){
    return localStorage.setItem(USER_KEY, data)
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  // USER
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser() {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  },

  // CLEAR EVERYTHING (logout)
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}
