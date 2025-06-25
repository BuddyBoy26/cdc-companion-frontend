// app/admin/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { BACKEND_URL } from '@/constants/apiConstants'

interface Reviewee {
  id: number
  name: string
  rollNo: string
  email: string | null
  cvLink: string | null
  profile: string
  status: boolean
  submissionTime: string
  assignedToId: number | null
}

interface Reviewer {
  id: number
  name: string
  profiles: string[]
  reviewsNumber: number
  reviewedCount: number
  email: string | null
  admin: boolean
}

interface Review {
  id: number
  comments: string[]
  submissionTime: string
  reviewee: Reviewee
  reviewer: Reviewer
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { authFetch, logout, user, isAuthenticated } = useAuth()
  const [reviewees, setReviewees] = useState<Reviewee[]>([])
  const [reviewers, setReviewers]   = useState<Reviewer[]>([])
  const [reviews, setReviews]       = useState<Review[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [allocating, setAllocating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login/admin')
      return
    }
    async function loadAll() {
      try {
        setLoading(true)
        const [rqs, rrs, res] = await Promise.all([
          authFetch(`${BACKEND_URL}/api/admin/reviewees`),
          authFetch(`${BACKEND_URL}/api/admin/reviewers`),
          authFetch(`${BACKEND_URL}/api/admin/reviews`),
        ])
        if (!rqs.ok || !rrs.ok || !res.ok) {
          throw new Error('Failed to fetch data')
        }
        setReviewees(await rqs.json())
        setReviewers(await rrs.json())
        setReviews(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [isAuthenticated, user, authFetch, router])

  const handleAllocate = async () => {
    setAllocating(true)
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/allocate`, { method: 'POST' })
      if (!res.ok) throw new Error('Allocation failed')
      // reload reviewees to see assignments
      const updated = await authFetch(`${BACKEND_URL}/api/admin/reviewees`)
      if (updated.ok) setReviewees(await updated.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAllocating(false)
    }
  }

  if (loading) {
    return <p className="p-8">Loading admin dashboard…</p>
  }
  if (error) {
    return <p className="p-8 text-red-600">Error: {error}</p>
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => { logout(); router.push('/login') }}
        >
          Logout
        </button>
      </header>

      <section>
        <button
          className={`px-4 py-2 bg-blue-600 text-white rounded ${allocating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          onClick={handleAllocate}
          disabled={allocating}
        >
          {allocating ? 'Allocating…' : 'Run Allocation'}
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Reviewees</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Profile</th>
              <th className="border px-2 py-1">Assigned To</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviewees.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{r.id}</td>
                <td className="border px-2 py-1">{r.name}</td>
                <td className="border px-2 py-1">{r.profile}</td>
                <td className="border px-2 py-1">{r.assignedToId ?? '—'}</td>
                <td className="border px-2 py-1">{r.status ? 'Reviewed' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Reviewers</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Profiles</th>
              <th className="border px-2 py-1">Reviewed / Quota</th>
            </tr>
          </thead>
          <tbody>
            {reviewers.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{r.id}</td>
                <td className="border px-2 py-1">{r.name}</td>
                <td className="border px-2 py-1">{r.profiles.join(', ')}</td>
                <td className="border px-2 py-1">{r.reviewedCount} / {r.reviewsNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Reviews</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Reviewee</th>
              <th className="border px-2 py-1">Reviewer</th>
              <th className="border px-2 py-1">Comments</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{r.id}</td>
                <td className="border px-2 py-1">{r.reviewee.name}</td>
                <td className="border px-2 py-1">{r.reviewer.name}</td>
                <td className="border px-2 py-1">
                  <ul className="list-disc pl-5">
                    {r.comments.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
