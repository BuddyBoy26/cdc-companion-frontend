'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye,
  LogOut,
  RefreshCw,
  User,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL } from '@/constants/apiConstants'

interface Reviewee {
  id: number
  name: string
  rollNo: string
  email?: string
  cvLink: string
  profile: string
}

interface ReviewerInfo {
  id: number
  name: string
  profiles: string[]
  reviewedCount: number
  reviewsNumber: number
}

interface AssignedReview extends Reviewee {
  status: boolean
  assignedAt: string
  submittedAt?: string
}

// Header Component
function DashboardHeader({
  reviewerName,
  onLogout,
}: {
  reviewerName?: string
  onLogout: () => void
}) {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 rounded-2xl p-6 shadow-2xl border border-purple-700/30">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Reviewer Dashboard</h1>
            {reviewerName && (
              <p className="text-purple-200 mt-1">Welcome back, {reviewerName}</p>
            )}
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600/20 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-600/30 transition-all duration-300 backdrop-blur-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}

// Stats Card Component
function StatsCard({ reviewerInfo }: { reviewerInfo: ReviewerInfo }) {
  return (
    <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2 text-yellow-400" />
        Reviewer Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-700/30 rounded-xl p-4 border border-purple-500/20">
          <p className="text-purple-200 text-sm">Profiles</p>
          <p className="text-white font-semibold text-lg">
            {reviewerInfo.profiles.join(', ')}
          </p>
        </div>
        <div className="bg-green-700/30 rounded-xl p-4 border border-green-500/20">
          <p className="text-green-200 text-sm">Completed</p>
          <p className="text-white font-semibold text-2xl">
            {reviewerInfo.reviewedCount}
          </p>
        </div>
        <div className="bg-orange-700/30 rounded-xl p-4 border border-orange-500/20">
          <p className="text-orange-200 text-sm">Remaining</p>
          <p className="text-white font-semibold text-2xl">
            {reviewerInfo.reviewsNumber - reviewerInfo.reviewedCount}
          </p>
        </div>
        <div className="bg-blue-700/30 rounded-xl p-4 border border-blue-500/20">
          <p className="text-blue-200 text-sm">Total Assigned</p>
          <p className="text-white font-semibold text-2xl">
            {reviewerInfo.reviewsNumber}
          </p>
        </div>
      </div>
    </div>
  )
}

// Load Next CV Button Component
function LoadNextCVButton({
  onLoadNext,
  loading,
  hasRemainingReviews,
}: {
  onLoadNext: () => void
  loading: boolean
  hasRemainingReviews: boolean
}) {
  if (!hasRemainingReviews) {
    return (
      <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 shadow-xl text-center">
        <div className="py-8">
          <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-green-400 font-medium text-lg">All reviews completed!</p>
          <p className="text-purple-200 mt-2">You have finished all your assigned reviews.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 shadow-xl text-center">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center justify-center">
        <FileText className="w-5 h-5 mr-2 text-purple-400" />
        Load Next CV
      </h2>
      <button
        onClick={onLoadNext}
        disabled={loading}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center space-x-2 mx-auto font-medium text-lg"
      >
        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        <span>{loading ? 'Loading...' : 'Load Next CV'}</span>
      </button>
    </div>
  )
}

// Assigned CVs Table Component
function AssignedCVsTable({
  assigned,
  onRefresh,
  onOpenReview,
  loading,
}: {
  assigned: AssignedReview[]
  onRefresh: () => void
  onOpenReview: (rev: AssignedReview) => void
  loading: boolean
}) {
  return (
    <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-purple-400" />
          My Assigned CVs ({assigned.length})
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-600/50 transition-all duration-300 flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      {assigned.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-purple-300">No assigned CVs yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assigned.map((rev) => (
            <div
              key={rev.id}
              onClick={() => onOpenReview(rev)}
              className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-5 hover:bg-purple-900/50 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
                    {rev.name}
                  </h3>
                  <p className="text-purple-300 text-sm">Roll No: {rev.rollNo}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {rev.status ? (
                    <span className="flex items-center space-x-1 text-green-400 bg-green-400/20 px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-3 h-3" />
                      <span>Reviewed</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-orange-400 bg-orange-400/20 px-3 py-1 rounded-full text-sm">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-purple-200 text-sm">Profile</p>
                  <p className="text-white text-sm">{rev.profile}</p>
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Assigned At</p>
                  <p className="text-white text-sm">
                    {new Date(rev.assignedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {rev.submittedAt && (
                <div className="mb-3">
                  <p className="text-purple-200 text-sm">Submitted At</p>
                  <p className="text-white text-sm">
                    {new Date(rev.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
              <a
                href={rev.cvLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>View CV</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Review Form Component
function ReviewForm({
  selectedAssigned,
  ratings,
  submittedAssigned,
  onRatingChange,
  onSubmit,
  onClose,
}: {
  selectedAssigned: AssignedReview
  ratings: string[]
  submittedAssigned: boolean
  onRatingChange: (idx: number, value: string) => void
  onSubmit: (e: FormEvent) => void
  onClose: () => void
}) {
  const criteriaLabels = [
    'Structure & Format',
    'Relevance to Domain',
    'Depth of Explanation',
    'Language and Grammar',
    'Improvements in Projects',
    'Additional Suggestions',
  ]

  return (
    <div className="bg-gradient-to-br from-purple-800/40 to-indigo-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 shadow-xl">
      <h2 className="text-xl font-semibold text-white mb-6">
        Reviewing: {selectedAssigned.name} ({selectedAssigned.rollNo})
      </h2>
      {!submittedAssigned ? (
        <form onSubmit={onSubmit} className="space-y-6">
          {criteriaLabels.map((label, idx) => (
            <div key={idx}>
              <label className="block text-purple-200 text-sm font-medium mb-2">
                {label}
              </label>
              <textarea
                value={ratings[idx]}
                onChange={(e) => onRatingChange(idx, e.target.value)}
                rows={3}
                className="w-full p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={`Enter feedback for ${label.toLowerCase()}...`}
                required
              />
            </div>
          ))}
          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg font-medium"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 bg-gray-600/30 border border-gray-500/30 text-gray-300 rounded-xl hover:bg-gray-600/50 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-green-400 font-medium mb-4 text-lg">
            Review submitted successfully!
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-600/50 transition-all duration-300"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

// Main Dashboard Component
export default function ReviewerDashboard() {
  const router = useRouter()
  const { logout } = useAuth()
  const [loadingNext, setLoadingNext] = useState(false)
  const [loadingAssigned, setLoadingAssigned] = useState(false)
  const [reviewerInfo, setReviewerInfo] = useState<ReviewerInfo | null>(null)
  const [assigned, setAssigned] = useState<AssignedReview[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedAssigned, setSelectedAssigned] = useState<AssignedReview | null>(null)
  const [ratings, setRatings] = useState<string[]>(['', '', '', '', '', ''])
  const [submittedAssigned, setSubmittedAssigned] = useState(false)

  // Redirect if no token
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login')
    } else {
      loadAssigned()
    }
  }, [])

  const loadAssigned = async () => {
    setError(null)
    setLoadingAssigned(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/assigned`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (!res.ok) throw new Error('Failed to fetch assigned CVs')
      const data: { reviewer: ReviewerInfo; assigned: AssignedReview[] } =
        await res.json()
      setReviewerInfo(data.reviewer)
      setAssigned(data.assigned)
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message)
    } finally {
      setLoadingAssigned(false)
    }
  }

  const loadNext = async () => {
    setError(null)
    setLoadingNext(true)
    try {
      const nextRes = await fetch(`${BACKEND_URL}/api/reviewer/next`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (!nextRes.ok && nextRes.status !== 204) {
        throw new Error('Failed to fetch next CV')
      }
      await loadAssigned()
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message)
    } finally {
      setLoadingNext(false)
    }
  }

  const openAssignedReview = (rev: AssignedReview) => {
    setSelectedAssigned(rev)
    setRatings(['', '', '', '', '', ''])
    setSubmittedAssigned(false)
    setError(null)
  }

  const handleRatingChange = (idx: number, value: string) => {
    const copy = [...ratings]
    copy[idx] = value
    setRatings(copy)
  }

  const handleAssignedSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedAssigned) return
    if (ratings.some((r) => !r.trim())) {
      setError('Please fill out all review fields before submitting.')
      return
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          revieweeId: selectedAssigned.id,
          comments: ratings,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Review submission failed')
      }
      setSubmittedAssigned(true)
      await loadAssigned()
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login/reviewer')
  }

  if (loadingAssigned && !reviewerInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader reviewerName={reviewerInfo?.name} onLogout={handleLogout} />

        {reviewerInfo && <StatsCard reviewerInfo={reviewerInfo} />}

        <LoadNextCVButton
          onLoadNext={loadNext}
          loading={loadingNext}
          hasRemainingReviews={
            !!reviewerInfo && reviewerInfo.reviewedCount < reviewerInfo.reviewsNumber
          }
        />

        <AssignedCVsTable
          assigned={assigned}
          onRefresh={loadAssigned}
          onOpenReview={openAssignedReview}
          loading={loadingAssigned}
        />

        {selectedAssigned && (
          <ReviewForm
            selectedAssigned={selectedAssigned}
            ratings={ratings}
            submittedAssigned={submittedAssigned}
            onRatingChange={handleRatingChange}
            onSubmit={handleAssignedSubmit}
            onClose={() => setSelectedAssigned(null)}
          />
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-600/20 text-red-200 p-4 rounded-xl shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
