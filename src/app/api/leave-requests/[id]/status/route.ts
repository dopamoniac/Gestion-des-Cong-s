import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    const existingRequest = await db.leaveRequest.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      )
    }

    const updatedRequest = await db.leaveRequest.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    console.error('Update leave status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
