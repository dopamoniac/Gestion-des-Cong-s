import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, employeeId, startDate, endDate, leaveType, notes } = body

    if (!name || !startDate || !endDate || !leaveType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, startDate, endDate, leaveType' },
        { status: 400 }
      )
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        name,
        phone: phone || null,
        employeeId: employeeId || null,
        startDate,
        endDate,
        leaveType,
        notes: notes || null,
      },
    })

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    console.error('Create leave request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const name = searchParams.get('name')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (name) {
      where.name = { contains: name }
    }

    if (from && to) {
      where.startDate = { gte: from, lte: to }
    } else if (from) {
      where.startDate = { gte: from }
    } else if (to) {
      where.endDate = { lte: to }
    }

    const requests = await db.leaveRequest.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Get leave requests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
