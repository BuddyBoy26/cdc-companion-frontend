// pages/login.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL } from '@/constants/apiConstants'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      const { token, reviewer } = data
      localStorage.setItem('token', token)
      // you could also do: loginWithToken(token, reviewer)
      router.push('/reviewer')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, rgba(15,23,42,.9), rgba(76,29,149,.9)),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
          `,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          opacity: 0.2,
        }}
      />

      {/* Floating Blurs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
        {/* Banner */}
        <div className="w-full max-w-4xl mx-auto transform transition-transform duration-300 hover:scale-105">
          <img
            src="/banner.png"
            alt="Banner"
            className="w-full h-auto rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm"
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="p-8 space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
            {/* Header */}
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                Welcome Back
              </h1>
              <p className="text-sm text-purple-200/80">Sign in to access your reviewer dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 text-center text-red-200 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl animate-shake">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {[{ label: 'Full Name', type: 'text', value: name, onChange: setName, iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { label: 'Password', type: 'password', value: password, onChange: setPassword, iconPath: 'M12 15v2a3 3 0 11-6 0v-2M6 15V9a3 3 0 116 0v6m0 0h6a2 2 0 012 2v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 012-2h6z' }
              ].map(({ label, type, value, onChange, iconPath }) => (
                <div key={label} className="space-y-2">
                  <label className="block text-sm font-medium text-purple-200">{label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                      </svg>
                    </div>
                    <input
                      type={type}
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      required
                      className="w-full px-4 py-3 pl-10 text-white placeholder-purple-300/60 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:border-purple-400/50 focus:ring-purple-500/50 transition-all duration-200"
                      placeholder={`Enter your ${label.toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 font-semibold text-white transition-transform duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  isLoading
                    ? 'bg-purple-600/50 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="pt-4 text-center border-t border-white/10">
              <p className="text-sm text-purple-200/60">Secure reviewer access portal</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
