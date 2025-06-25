'use client'

import { useState, FormEvent } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import { BACKEND_URL } from "@/constants/apiConstants"

// Constants
const PROFILES = [
  { key: "Core",          value: "Core" },
  { key: "Consult",       value: "Consult" },
  { key: "Data",          value: "Data" },
  { key: "Finance/Quant", value: "Finance/Quant" },
  { key: "Product/FMCG",  value: "Product/FMCG" },
  { key: "Software",      value: "Software" },
]

const EMAIL_REGEX = /^[^@]+@kgpian\.iitkgp\.ac\.in$/

// Types
interface FormData {
  fullName: string
  email: string
  rollNo: string
  driveLink: string
  profile: string
}

interface SubmissionData {
  name: string       // maps from fullName
  rollNo: string
  email: string
  cvLink: string     // maps from driveLink
  profile: string
}

export default function RegisterPage() {
  const { authFetch } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    rollNo: "",
    driveLink: "",
    profile: PROFILES[0].value,
  })

  // UI state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const { fullName, email, rollNo, driveLink } = formData
    if (!fullName || !email || !rollNo || !driveLink) {
      setError("Please fill in all required fields")
      return false
    }
    if (!EMAIL_REGEX.test(email) ) {
      setError("Email must end with @kgpian.iitkgp.ac.in")
      return false
    }
const cleaned = rollNo.trim();
const ROLL_REGEX = /^(?:22[A-Za-z]{2}3.*|23[A-Za-z]{2}1.*)$/;

if (!ROLL_REGEX.test(cleaned)) {
  setError("Roll must start with 22XX3… or 23XX1…, where XX are letters");
  return false;
}

    return true
  }

  const submitApplication = async (data: SubmissionData) => {
    const res = await authFetch(`${BACKEND_URL}/api/reviewee/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error || "Submission failed")
    }
    return json
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload: SubmissionData = {
        name: formData.fullName,
        rollNo: formData.rollNo,
        email: formData.email,
        cvLink: formData.driveLink,
        profile: formData.profile,
      }
      await submitApplication(payload)
      setShowConfirmation(true)
    } catch (e: unknown) {
  if (e instanceof Error) {
    setError(e.message)
  }
    } finally {
      setIsLoading(false)
    }
  }

  // Top Navigation with Login Button
  const TopNavigation = () => (
  <div className="fixed top-0 right-0 p-6 z-10 flex flex-col space-y-4">
    <Link
      href="/login/admin"
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
    >
      Admin Login
    </Link>
    <Link
      href="/login/reviewer"
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
    >
      Reviewer Login
    </Link>
  </div>
)

  // Success view
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-green-900/80 to-emerald-900/80 backdrop-blur-xl border border-green-500/20 p-10 pt-20 rounded-3xl w-full max-w-md text-center shadow-2xl relative z-10"
    >
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-green-300 mb-4">
        CV Successfully Submitted!
      </h2>
      <p className="text-green-100/80 mb-8 leading-relaxed">
        We’ll notify you via email once your CV review is complete.
      </p>
      {/* Return home link */}
      {/* <Link
        href="/"
        className="inline-block mb-4 text-sm text-green-200 underline hover:text-green-100"
      >
        Go back to Homepage
      </Link> */}
      {/* Try PrepNest link */}
      <a
        href="https://prepnest.in/?refercode=PrepGrow-sahib-singhprepgrowthpartner-02"
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-4 font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full transition"
      >
        Try PrepNest
      </a>
      {/* Your provided image */}
      <img
        src="./prepnest.jpg"
        alt="PrepNest Logo"
        className="mx-auto mt-4 w-96 object-contain rounded-3xl shadow-2xl border border-white/10 backdrop-blur-sm"
      />
    </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <TopNavigation />

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto mb-8 relative z-10"
      >
        <img
          src="/banner.png"
          alt="Banner"
          className="w-full rounded-2xl shadow-2xl border border-white/10"
        />
      </motion.div>

      {/* Main Form */}
      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <motion.h2 
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Submit Your CV
            </motion.h2>
            <p className="text-slate-400 text-lg">
              Get expert feedback from experienced seniors
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-center backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm"
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Roll Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.rollNo}
                onChange={(e) => handleInputChange("rollNo", e.target.value)}
                placeholder="22XX9999"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm"
              />
            </div>

            {/* Institute Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Institute Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="name@kgpian.iitkgp.ac.in"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm"
              />
            </div>

            {/* Drive Link */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                CV Drive Link <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={formData.driveLink}
                onChange={(e) => handleInputChange("driveLink", e.target.value)}
                placeholder="https://drive.google.com/..."
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm"
              />
            </div>

            {/* Target Profile */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Profile <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.profile}
                onChange={(e) => handleInputChange("profile", e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                {PROFILES.map(p => (
                  <option key={p.key} value={p.value} className="bg-slate-800">
                    {p.key}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 text-white font-semibold rounded-xl transition-all duration-300 ${
                isLoading
                  ? "bg-purple-600/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/25"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting CV...
                </div>
              ) : (
                "Submit CV for Review"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}