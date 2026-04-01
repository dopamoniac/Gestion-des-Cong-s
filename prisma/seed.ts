import bcrypt from 'bcryptjs'
import { db } from '../src/lib/db'

async function seed() {
  console.log('🌱 Seeding database...')

  // 1. Create HR user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const hrUser = await db.hRUser.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'HR Admin',
    },
  })

  console.log(`✅ Created HR user: ${hrUser.email}`)

  // 2. Create sample leave requests
  const sampleRequests = [
    {
      name: 'John Worker',
      phone: '13800138001',
      employeeId: 'EMP001',
      startDate: '2025-02-10',
      endDate: '2025-02-12',
      leaveType: 'sick',
      status: 'approved',
      notes: 'Catching a cold, doctor note attached',
    },
    {
      name: 'Jane Operator',
      phone: '13800138002',
      employeeId: 'EMP002',
      startDate: '2025-02-15',
      endDate: '2025-02-15',
      leaveType: 'personal',
      status: 'rejected',
      notes: 'Family matters',
    },
    {
      name: 'Mike Technician',
      phone: '13800138003',
      employeeId: 'EMP003',
      startDate: '2025-02-20',
      endDate: '2025-02-25',
      leaveType: 'annual',
      status: 'pending',
      notes: 'Vacation with family',
    },
    {
      name: 'Sarah Supervisor',
      phone: '13800138004',
      employeeId: 'EMP004',
      startDate: '2025-03-01',
      endDate: '2025-03-03',
      leaveType: 'sick',
      status: 'pending',
      notes: 'Fever and headache',
    },
    {
      name: 'Tom Inspector',
      phone: '13800138005',
      employeeId: 'EMP005',
      startDate: '2025-03-10',
      endDate: '2025-03-14',
      leaveType: 'annual',
      status: 'approved',
      notes: 'Travel plans',
    },
  ]

  for (const req of sampleRequests) {
    await db.leaveRequest.create({ data: req })
  }

  console.log(`✅ Created ${sampleRequests.length} sample leave requests`)
  console.log('🎉 Seed completed!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
