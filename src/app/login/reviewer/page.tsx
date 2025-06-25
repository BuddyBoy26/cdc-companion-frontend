// pages/login.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { BACKEND_URL } from '@/constants/apiConstants'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)


  // inside your login page component...

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)

  try {
    // 1) call the reviewer login endpoint
    const res = await fetch(`${BACKEND_URL}/api/reviewer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, password }),
    })

    // 2) parse the JSON
    const data = await res.json()

    if (!res.ok) {
      // login failed
      throw new Error(data.error || 'Login failed')
    }

    // 3) on success you get back { token, reviewer: { id, name, profiles, isAdmin } }
    const { token, reviewer } = data

    // 4) store the token however you like (localStorage, cookie, context…)
    localStorage.setItem('token', token)
    console.log(token)
    // if you have an AuthContext, you might do:
    // authContext.loginWithToken(token, reviewer)

    // 5) redirect into your reviewer area
    router.push('/reviewer')
  } catch (err: any) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">

         <img
        src="/banner.png"
        alt="Banner"
        className="w-full max-w-3xl mx-auto mb-6 rounded-lg shadow-lg"
      />
      
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Login
        </h1>

        {error && (
          <div className="bg-red-600/20 text-red-300 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 text-white rounded font-semibold transition ${
              isLoading
                ? 'bg-purple-700 opacity-70 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
