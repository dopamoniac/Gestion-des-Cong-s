import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      db.leaveRequest.count(),
      db.leaveRequest.count({ where: { status: 'pending' } }),
      db.leaveRequest.count({ where: { status: 'approved' } }),
      db.leaveRequest.count({ where: { status: 'rejected' } }),
    ])

    return NextResponse.json({ total, pending, approved, rejected })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
