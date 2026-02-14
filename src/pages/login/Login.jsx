import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import login_background from '@/assets/login_background.png'
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"




function Login(){
  
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  
  const handleSubmit = (e) => {
  e.preventDefault() // stop refresh

  console.log("Username:", username)
  console.log("Password:", password)
}

  
  
  return(
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
                onChange={(e)=>setPassword(e.target.value)}
                />
                {/*<FieldDescription>
                Choose a unique username for your account.
                </FieldDescription>*/}
                <Button type="submit" className="w-full">
                Login
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