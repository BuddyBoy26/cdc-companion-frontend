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
  password: string
  profiles: string[]
  reviewsNumber: number
  reviewedCount: number
  email: string | null
  admin: boolean
  assignedCVs: Reviewee[]
}

interface Review {
  id: number
  comments: string[]
  submissionTime: string
  reviewee: Reviewee
  reviewer: Reviewer
}

type SortDirection = 'asc' | 'desc' | null

interface SortState {
  column: string | null
  direction: SortDirection
}

// --------------------------------
// Reviewees Table Component
// --------------------------------
function RevieweesTable({ reviewees }: { reviewees: Reviewee[] }) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })

  const handleSort = (column: string) => {
    let direction: SortDirection = 'asc'
    if (sortState.column === column && sortState.direction === 'asc') {
      direction = 'desc'
    } else if (sortState.column === column && sortState.direction === 'desc') {
      direction = null
    }
    setSortState({ column, direction })
  }

  const getSortIcon = (column: string) => {
    if (sortState.column !== column) return '↕️'
    if (sortState.direction === 'asc') return '↑'
    if (sortState.direction === 'desc') return '↓'
    return '↕️'
  }

  const sortedReviewees = [...reviewees].sort((a, b): number => {
    if (!sortState.column || !sortState.direction) return 0

    const key = sortState.column as keyof Reviewee
    let aValue: string | number | boolean | Reviewee[] | string[] = a[key] ?? ''
    let bValue: string | number | boolean | Reviewee[] | string[] = b[key] ?? ''

    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()

    if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Reviewees</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {['id', 'name', 'rollNo', 'profile', 'assignedToId', 'status'].map(column => (
              <th
                key={column}
                className="border px-2 py-1 cursor-pointer hover:bg-gray-300 select-none"
                onClick={() => handleSort(column)}
              >
                {column === 'id' ? 'ID' :
                 column === 'rollNo' ? 'Roll Number' :
                 column === 'assignedToId' ? 'Assigned To' :
                 column === 'status' ? 'Status' :
                 column.charAt(0).toUpperCase() + column.slice(1)
                } {getSortIcon(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedReviewees.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{r.id}</td>
              <td className="border px-2 py-1">{r.name}</td>
              <td className="border px-2 py-1">{r.rollNo}</td>
              <td className="border px-2 py-1">{r.profile}</td>
              <td className="border px-2 py-1">{r.assignedToId ?? '—'}</td>
              <td className="border px-2 py-1">{r.status ? 'Reviewed' : 'Pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

// --------------------------------
// Reviewers Table Component
// --------------------------------
function ReviewersTable({ reviewers }: { reviewers: Reviewer[] }) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })

  const handleSort = (column: string) => {
    let direction: SortDirection = 'asc'
    if (sortState.column === column && sortState.direction === 'asc') {
      direction = 'desc'
    } else if (sortState.column === column && sortState.direction === 'desc') {
      direction = null
    }
    setSortState({ column, direction })
  }

  const getSortIcon = (column: string) => {
    if (sortState.column !== column) return '↕️'
    if (sortState.direction === 'asc') return '↑'
    if (sortState.direction === 'desc') return '↓'
    return '↕️'
  }

  const sortedReviewers = [...reviewers].sort((a, b): number => {
    if (!sortState.column || !sortState.direction) return 0

    let aValue: string | number | boolean | Reviewee[] | string[]
    let bValue: string | number | boolean | Reviewee[] | string[]

    switch (sortState.column) {
      case 'profiles':
        aValue = a.profiles.join(', ').toLowerCase()
        bValue = b.profiles.join(', ').toLowerCase()
        break
      case 'assignedCVs':
        aValue = a.assignedCVs.length
        bValue = b.assignedCVs.length
        break
      default:
        const key = sortState.column as keyof Reviewer
        aValue = a[key] ?? ''
        bValue = b[key] ?? ''
        if (typeof aValue === 'string') aValue = aValue.toLowerCase()
        if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Reviewers</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            {['id', 'name', 'password', 'profiles', 'reviewedCount', 'assignedCVs'].map(column => (
              <th
                key={column}
                className="border px-2 py-1 cursor-pointer hover:bg-gray-300 select-none"
                onClick={() => handleSort(column)}
              >
                {column === 'id' ? 'ID' :
                 column === 'password' ? 'Password' :
                 column === 'profiles' ? 'Profiles' :
                 column === 'reviewedCount' ? 'Reviewed / Quota' :
                 column === 'assignedCVs' ? 'Assigned CVs' :
                 column.charAt(0).toUpperCase() + column.slice(1)
                } {getSortIcon(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedReviewers.map(r => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{r.id}</td>
              <td className="border px-2 py-1">{r.name}</td>
              <td className="border px-2 py-1">{r.password}</td>
              <td className="border px-2 py-1">{r.profiles.join(', ')}</td>
              <td className="border px-2 py-1">
                {r.reviewedCount} / {r.reviewsNumber}
              </td>
              <td className="border px-2 py-1">{r.assignedCVs.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

// --------------------------------
// Reviews Table Component
// --------------------------------
function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null })

  const handleSort = (column: string) => {
    let direction: SortDirection = 'asc'
    if (sortState.column === column && sortState.direction === 'asc') {
      direction = 'desc'
    } else if (sortState.column === column && sortState.direction === 'desc') {
      direction = null
    }
    setSortState({ column, direction })
  }

  const getSortIcon = (column: string) => {
    if (sortState.column !== column) return '↕️'
    if (sortState.direction === 'asc') return '↑'
    if (sortState.direction === 'desc') return '↓'
    return '↕️'
  }

  const sortedReviews = [...reviews].sort((a, b): number => {
    if (!sortState.column || !sortState.direction) return 0

    let aValue: string | number
    let bValue: string | number

    if (sortState.column === 'reviewee') {
      aValue = a.reviewee.name.toLowerCase()
      bValue = b.reviewee.name.toLowerCase()
    } else if (sortState.column === 'reviewer') {
      aValue = a.reviewer.name.toLowerCase()
      bValue = b.reviewer.name.toLowerCase()
    } else {
      const key = sortState.column as keyof Review
      aValue = (a[key] as string) ?? ''
      bValue = (b[key] as string) ?? ''
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1
    return 0
  })

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Reviews</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1 cursor-pointer hover:bg-gray-300 select-none" onClick={() => handleSort('id')}>
              ID {getSortIcon('id')}
            </th>
            <th className="border px-2 py-1 cursor-pointer hover:bg-gray-300 select-none" onClick={() => handleSort('reviewee')}>
              Reviewee {getSortIcon('reviewee')}
            </th>
            <th className="border px-2 py-1 cursor-pointer hover:bg-gray-300 select-none" onClick={() => handleSort('reviewer')}>
              Reviewer {getSortIcon('reviewer')}
            </th>
            <th className="border px-2 py-1">Comments</th>
          </tr>
        </thead>
        <tbody>
          {sortedReviews.map(r => (
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
  )
}

// --------------------------------
// Main Admin Dashboard Component
// --------------------------------
export default function AdminDashboardPage() {
  const router = useRouter()
  const { authFetch, logout, user, isAuthenticated } = useAuth()
  const [reviewees, setReviewees] = useState<Reviewee[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allocating, setAllocating] = useState(false)

  useEffect(() => {
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
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/login/admin')
    } else {
      loadAll()
    }
  }, [isAuthenticated, user, authFetch, router])

  const handleAllocate = async () => {
    setAllocating(true)
    try {
      const res = await authFetch(`${BACKEND_URL}/api/admin/allocate`, { method: 'POST' })
      if (!res.ok) throw new Error('Allocation failed')
      const updated = await authFetch(`${BACKEND_URL}/api/admin/reviewees`)
      if (updated.ok) setReviewees(await updated.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setAllocating(false)
    }
  }

  if (loading) return <p className="p-8">Loading admin dashboard…</p>
  if (error) return <p className="p-8 text-red-600">Error: {error}</p>

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
          className={`px-4 py-2 bg-blue-600 text-white rounded ${
            allocating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          onClick={handleAllocate}
          disabled={allocating}
        >
          {allocating ? 'Allocating…' : 'Run Allocation'}
        </button>
      </section>

      <RevieweesTable reviewees={reviewees} />
      <ReviewersTable reviewers={reviewers} />
      <ReviewsTable reviews={reviews} />
    </div>
  )
}
