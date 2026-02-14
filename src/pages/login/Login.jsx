import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginUser } from "@/services/auth"
import { localStorageService } from "@/services/localStorageService"

import login_background from '@/assets/login_background.png'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"




function Login() {


  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")



  const handleSubmit = async (e) => {
    e.preventDefault() // stop refresh
    try {
      setLoading(true);
      setError("");

      const response = await loginUser({
        email: username,
        password: password,
      })
      console.log("headers", response.header)
      // suppose backend sends token
      localStorageService.setToken(response.headers.get("authorization"));
      localStorageService.setUser(response.data.user);

      console.log("response", response);
      console.log("Login success")

      // later → redirect user
    } catch (err) {
      console.log("error", err, response)
      setError("Invalid credentials")
    } finally {
      setLoading(false)
    }
  }



  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="w-1/2 bg-gray-100">
          <div className="flex flex-col justify-center h-full px-20 gap-6">
            <div>Bulls Lab</div>
            <div>Welcome back! Please login to your account.</div>
            <form onSubmit={handleSubmit} className="space-y-4">

              <Field>
                <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
                <Input
                  id="input-field-username"
                  type="text"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {/*<FieldDescription>
                Choose a unique username for your account.
                </FieldDescription>*/}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your  password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {/*<FieldDescription>
                Choose a unique username for your account.
                </FieldDescription>*/}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>

              </Field>
            </form>
          </div>
        </div>
        <div className="w-1/2 bg-white">
          <img
            src={login_background}
            alt="Login Background"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </>
  )
}


export default Login;