'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
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

// Reviewer info returned from the API
interface ReviewerInfo {
  id: number
  name: string
  profiles: string[]
  reviewedCount: number
  reviewsNumber: number
}

// AssignedReview with boolean status
interface AssignedReview extends Reviewee {
  status: boolean       // false = not reviewed, true = reviewed
  assignedAt: string    // ISO timestamp
  submittedAt?: string  // ISO timestamp, if reviewed
}

export default function ReviewerDashboard() {
  const router = useRouter()
  const { logout, user, isAuthenticated } = useAuth()

  // Next CV
  const [cv, setCv] = useState<Reviewee | null>(null)
  const [loadingNext, setLoadingNext] = useState(false)
  const [submittedNext, setSubmittedNext] = useState(false)
  const [commentsText, setCommentsText] = useState('')

  // Assigned CVs + reviewer info
  const [reviewerInfo, setReviewerInfo] = useState<ReviewerInfo | null>(null)
  const [assigned, setAssigned] = useState<AssignedReview[]>([])
  const [loadingAssigned, setLoadingAssigned] = useState(false)

  // Shared
  const [error, setError] = useState<string | null>(null)

  // Six-field form for assigned CV
  const [selectedAssigned, setSelectedAssigned] = useState<AssignedReview | null>(null)
  const [ratings, setRatings] = useState<string[]>(['', '', '', '', '', ''])
  const [submittedAssigned, setSubmittedAssigned] = useState(false)
  const criteriaLabels = [
    'Structure & Format',
    'Relevance to Domain',
    'Depth of Explanation',
    'Language and Grammar',
    'Improvements in Projects',
    'Additional Suggestions',
  ]

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login/reviewer')
      return
    }
    loadAssigned()
  }, [isAuthenticated, user])

  // Load next unassigned CV
  async function loadNext() {
    setError(null)
    setLoadingNext(true)
    setSubmittedNext(false)
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/next`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (res.status === 204) {
        setCv(null)
      } else if (!res.ok) {
        throw new Error('Failed to fetch next CV')
      } else {
        setCv(await res.json())
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingNext(false)
      setCommentsText('')
    }
  }

  async function handleNextSubmit(e: FormEvent) {
    e.preventDefault()
    if (!cv) return
    const comments = commentsText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)

    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ revieweeId: cv.id, comments }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Review submission failed')
      }
      setSubmittedNext(true)
    } catch (e: any) {
      setError(e.message)
    }
  }

  // Load assigned CVs & reviewer details
  async function loadAssigned() {
    setError(null)
    setLoadingAssigned(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviewer/assigned`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (!res.ok) throw new Error('Failed to fetch assigned CVs')
      const data: { reviewer: ReviewerInfo; assigned: AssignedReview[] } = await res.json()
      setReviewerInfo(data.reviewer)
      setAssigned(data.assigned)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingAssigned(false)
    }
  }

  // Open review form for an assigned CV
  function openAssignedReview(r: AssignedReview) {
    setSelectedAssigned(r)
    setRatings(['', '', '', '', '', ''])
    setSubmittedAssigned(false)
    setError(null)
  }

  function handleRatingChange(idx: number, value: string) {
    const copy = [...ratings]
    copy[idx] = value
    setRatings(copy)
  }

  async function handleAssignedSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedAssigned) return
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
      // refresh list and reviewer stats
      loadAssigned()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loadingNext || loadingAssigned) {
    return <p className="p-8">Loading…</p>
  }
  if (error) {
    return <p className="p-8 text-red-600">Error: {error}</p>
  }

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reviewer Dashboard</h1>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => {
            logout()
            router.push('/login/reviewer')
          }}
        >
          Logout
        </button>
      </header>

      {/* Display reviewer details */}
      {reviewerInfo && (
        <section className="border-b pb-4">
          <p><strong>Reviewer:</strong> {reviewerInfo.name}</p>
          <p><strong>Profiles:</strong> {reviewerInfo.profiles.join(', ')}</p>
          <p><strong>Reviewed Count:</strong> {reviewerInfo.reviewedCount}</p>
          <p><strong>CVs left to Review:</strong> {reviewerInfo.reviewsNumber}</p>
        </section>
      )}

      {/* Next CV to Review */}
      <section className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold">Next CV to Review</h2>
        {!cv ? (
          <div className="space-x-2">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={loadNext}
            >
              Load Next CV
            </button>
            <span>No more unassigned CVs.</span>
          </div>
        ) : !submittedNext ? (
          <form onSubmit={handleNextSubmit} className="space-y-4 max-w-lg">
            <div>
              <p><strong>Name:</strong> {cv.name}</p>
              <p><strong>Roll No:</strong> {cv.rollNo}</p>
              <p><strong>Profile:</strong> {cv.profile}</p>
              <p>
                <strong>CV Link:</strong>{' '}
                <a
                  href={cv.cvLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View CV
                </a>
              </p>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Feedback (one per line)
              </label>
              <textarea
                value={commentsText}
                onChange={(e) => setCommentsText(e.target.value)}
                rows={6}
                className="w-full p-2 border rounded"
                placeholder="Formatting OK\nSpelling errors…"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <div className="space-x-2">
            <span className="text-green-600 font-medium">
              Review submitted!
            </span>
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={loadNext}
            >
              Load Next CV
            </button>
          </div>
        )}
      </section>

      {/* My Assigned CVs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">My Assigned CVs</h2>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={loadAssigned}
        >
          Refresh
        </button>

        {assigned.length === 0 ? (
          <p className="text-gray-500">No assigned CVs yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 max-w-xl">
            {assigned.map((r) => (
              <li
                key={r.id}
                className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => openAssignedReview(r)}
              >
                <div className="flex justify-between">
                  <p className="font-medium">{r.name} ({r.rollNo})</p>
                  <span className={r.status ? 'text-green-600' : 'text-yellow-600'}>
                    {r.status ? 'Reviewed' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm">Profile: {r.profile}</p>
                <p className="text-xs text-gray-500">
                  Assigned: {new Date(r.assignedAt).toLocaleString()}
                  {r.submittedAt &&
                    ` · Submitted: ${new Date(r.submittedAt).toLocaleString()}`}
                </p>
                <a
                  href={r.cvLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline text-sm"
                >
                  View CV
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Review Form for Assigned CV */}
      {selectedAssigned && (
        <section className="space-y-4 max-w-lg">
          <h2 className="text-xl font-semibold">
            Reviewing: {selectedAssigned.name} ({selectedAssigned.rollNo})
          </h2>
          {!submittedAssigned ? (
            <form onSubmit={handleAssignedSubmit} className="space-y-4">
              {criteriaLabels.map((label, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  <textarea
                    value={ratings[idx]}
                    onChange={(e) => handleRatingChange(idx, e.target.value)}
                    rows={2}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">
                Review submitted!
              </p>
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setSelectedAssigned(null)}
              >
                Close
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
