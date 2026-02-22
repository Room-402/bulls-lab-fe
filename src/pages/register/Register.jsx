import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"

import login_background from "@/assets/login_background.png"

async function registerUser(data) {
  const response = await fetch("http://localhost:8080/api/v1/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || "Registration failed")
  }
  return response
}

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    password: "",
    confirm_password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)

      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
        date_of_birth: form.date_of_birth,
        password: form.password,
      }

      await registerUser(payload)
      setSuccess(true)

      // Redirect to login after short delay
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-1/2 bg-gray-100">
        <div className="flex flex-col justify-center h-full px-20 gap-6 overflow-y-auto py-10">
          <div className="text-2xl font-bold">Bulls Lab</div>
          <div className="text-gray-600">Create your account and start your investment journey.</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="flex gap-4">
              <Field className="flex-1">
                <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field className="flex-1">
                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.phone_number}
                onChange={handleChange}
                maxLength={10}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="date_of_birth">Date of Birth</FieldLabel>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm_password">Confirm Password</FieldLabel>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirm_password}
                onChange={handleChange}
                required
              />
            </Field>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">Account created! Redirecting to login...</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-1/2 bg-white">
        <img
          src={login_background}
          alt="Register Background"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  )
}

export default Register