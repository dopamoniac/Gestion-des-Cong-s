'use client'

import { useState, useEffect, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

// ─── Types ────────────────────────────────────────────────────────────────────
type View = 'landing' | 'form' | 'confirmation' | 'track' | 'login' | 'dashboard'

interface LeaveRequest {
  id: string
  name: string
  phone: string | null
  employeeId: string | null
  startDate: string
  endDate: string
  leaveType: string
  status: string
  notes: string | null
  createdAt: string
}

interface HRUser {
  id: string
  email: string
  name: string
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  { value: 'sick', label: 'مرضية', labelFr: 'Sick Leave' },
  { value: 'annual', label: 'سنوية', labelFr: 'Annual Leave' },
  { value: 'emergency', label: 'طارئة', labelFr: 'Emergency' },
  { value: 'maternity', label: 'أمومة', labelFr: 'Maternity' },
  { value: 'unpaid', label: 'بدون راتب', labelFr: 'Unpaid' },
  { value: 'other', label: 'أخرى', labelFr: 'Other' },
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusBadge(status: string) {
  if (status === 'approved') return <span className="win-badge-approved">Approved — موافق</span>
  if (status === 'rejected') return <span className="win-badge-rejected">Rejected — مرفوض</span>
  return <span className="win-badge-pending">Pending — قيد المراجعة</span>
}

function getLeaveTypeLabel(type: string) {
  const found = LEAVE_TYPES.find((t) => t.value === type)
  return found ? `${found.label} — ${found.labelFr}` : type
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateStr
  }
}

// ─── Win2K Clock ──────────────────────────────────────────────────────────────
function Win2KClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      )
    update()
    const t = setInterval(update, 10000)
    return () => clearInterval(t)
  }, [])
  return <div className="win-clock">{time}</div>
}

// ─── Win2K Window Shell ───────────────────────────────────────────────────────
function WinWindow({
  title,
  icon,
  children,
  onClose,
}: {
  title: string
  icon?: string
  children: React.ReactNode
  onClose?: () => void
}) {
  return (
    <div className="win-window" style={{ width: '100%', maxWidth: 480 }}>
      {/* Title bar */}
      <div className="win-titlebar">
        {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>{title}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          <div className="win-titlebar-btn" title="Minimize">_</div>
          <div className="win-titlebar-btn" title="Maximize">&#9633;</div>
          <div
            className="win-titlebar-btn"
            title="Close"
            onClick={onClose}
            style={{ fontWeight: 'bold', color: onClose ? '#000' : '#808080' }}
          >
            ✕
          </div>
        </div>
      </div>
      {/* Content area */}
      <div style={{ padding: '8px' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing')
  const [hrUser, setHrUser] = useState<HRUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('hr_user')
        return stored ? (JSON.parse(stored) as HRUser) : null
      } catch {
        localStorage.removeItem('hr_user')
      }
    }
    return null
  })
  const [submittedRequest, setSubmittedRequest] = useState<LeaveRequest | null>(null)

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view)
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="win-desktop" style={{ paddingBottom: 50 }}>
      <Toaster position="top-center" closeButton />

      <div style={{ width: '100%', maxWidth: 480 }}>
        {currentView === 'landing' && <LandingView navigateTo={navigateTo} />}
        {currentView === 'form' && (
          <FormView
            navigateTo={navigateTo}
            onSubmitted={(req) => {
              setSubmittedRequest(req)
              navigateTo('confirmation')
            }}
          />
        )}
        {currentView === 'confirmation' && (
          <ConfirmationView request={submittedRequest} navigateTo={navigateTo} />
        )}
        {currentView === 'track' && <TrackView navigateTo={navigateTo} />}
        {currentView === 'login' && (
          <LoginView
            navigateTo={navigateTo}
            onLogin={(user) => {
              setHrUser(user)
              localStorage.setItem('hr_user', JSON.stringify(user))
              navigateTo('dashboard')
            }}
          />
        )}
        {currentView === 'dashboard' && (
          <DashboardView
            hrUser={hrUser}
            navigateTo={navigateTo}
            onLogout={() => {
              setHrUser(null)
              localStorage.removeItem('hr_user')
              toast.success('تم تسجيل الخروج')
              navigateTo('landing')
            }}
          />
        )}
      </div>

      {/* Taskbar */}
      <div className="win-taskbar">
        <button className="win-start-btn">
          <span style={{ fontSize: 14 }}>⊞</span>
          <span>Start</span>
        </button>
        <div
          className="win-btn"
          style={{ height: 22, margin: '0 4px', fontSize: 11, minWidth: 0, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span>📅</span>
          <span>Leave Management</span>
        </div>
        <Win2KClock />
      </div>
    </div>
  )
}

// ─── View 1: Landing ──────────────────────────────────────────────────────────
function LandingView({ navigateTo }: { navigateTo: (v: View) => void }) {
  return (
    <WinWindow title="Leave Management System — إدارة الإجازات" icon="📅">
      {/* Menu bar */}
      <div style={{
        background: '#d4d0c8',
        borderBottom: '1px solid #808080',
        marginBottom: 8,
        marginTop: -4,
        display: 'flex',
        gap: 0,
        fontSize: 11,
      }}>
        {['File', 'View', 'Help'].map((m) => (
          <div
            key={m}
            style={{ padding: '2px 8px', cursor: 'default' }}
            className="win-listitem"
          >
            {m}
          </div>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 0' }}>

        {/* Icon + Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>إدارة الإجازات</div>
          <div style={{ fontSize: 12, color: '#444' }}>Gestion des Congés</div>
          <div style={{ fontSize: 10, color: '#808080' }}>Leave Management System v1.0</div>
        </div>

        <div className="win-separator" style={{ width: '100%' }} />

        {/* QR Code in a sunken panel */}
        <div className="win-inset" style={{ padding: 8, display: 'inline-block' }}>
          <QRCodeSVG
            value={typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000'}
            size={140}
            level="H"
            bgColor="#ffffff"
            fgColor="#000080"
          />
        </div>
        <div style={{ fontSize: 10, color: '#808080', textAlign: 'center' }}>
          Scan QR Code — امسح الرمز للوصول السريع
        </div>

        <div className="win-separator" style={{ width: '100%' }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', padding: '0 16px' }}>
          <button
            className="win-btn win-btn-primary"
            style={{ height: 32, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}
            onClick={() => navigateTo('form')}
          >
            <span>📝</span>
            <span>طلب إجازة — Demander un congé</span>
          </button>

          <button
            className="win-btn"
            style={{ height: 32, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}
            onClick={() => navigateTo('track')}
          >
            <span>🔍</span>
            <span>تتبع الطلب — Suivre la demande</span>
          </button>
        </div>

        <div className="win-separator" style={{ width: '100%' }} />

        {/* HR link */}
        <button
          className="win-btn"
          style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => navigateTo('login')}
        >
          <span>🔒</span>
          <span>HR Dashboard — لوحة تحكم الموارد البشرية</span>
        </button>
      </div>

      {/* Status bar */}
      <div className="win-statusbar" style={{ marginTop: 8 }}>
        <div className="win-statusbar-pane" style={{ flex: 1 }}>Ready</div>
        <div className="win-statusbar-pane">v1.0</div>
      </div>
    </WinWindow>
  )
}

// ─── View 2: Form ─────────────────────────────────────────────────────────────
function FormView({
  navigateTo,
  onSubmitted,
}: {
  navigateTo: (v: View) => void
  onSubmitted: (req: LeaveRequest) => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    leaveType: '',
    notes: '',
  })

  const updateForm = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('يرجى إدخال الاسم الكامل'); return }
    if (!form.startDate) { toast.error('يرجى تحديد تاريخ البداية'); return }
    if (!form.endDate) { toast.error('يرجى تحديد تاريخ النهاية'); return }
    if (!form.leaveType) { toast.error('يرجى اختيار نوع الإجازة'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'حدث خطأ أثناء تقديم الطلب')
      }
      const data: LeaveRequest = await res.json()
      toast.success('تم تقديم الطلب بنجاح!')
      onSubmitted(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <WinWindow
      title="New Leave Request — طلب إجازة جديد"
      icon="📝"
      onClose={() => navigateTo('landing')}
    >
      <form onSubmit={handleSubmit}>
        {/* Fieldset: Personal Info */}
        <div className="win-groupbox" style={{ marginBottom: 10 }}>
          <span className="win-groupbox-title">Personal Information — المعلومات الشخصية</span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            <WinField label="Full Name — الاسم الكامل *">
              <input
                className="win-input"
                style={{ width: '100%', height: 22 }}
                type="text"
                placeholder="أدخل اسمك الكامل"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                required
              />
            </WinField>

            <WinField label="Phone — رقم الهاتف">
              <input
                className="win-input"
                style={{ width: '100%', height: 22 }}
                type="tel"
                placeholder="06XXXXXXXX"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
            </WinField>

            <WinField label="Employee ID — رقم الموظف">
              <input
                className="win-input"
                style={{ width: '100%', height: 22 }}
                type="text"
                placeholder="EMP-001"
                value={form.employeeId}
                onChange={(e) => updateForm('employeeId', e.target.value)}
              />
            </WinField>
          </div>
        </div>

        {/* Fieldset: Leave Details */}
        <div className="win-groupbox" style={{ marginBottom: 10 }}>
          <span className="win-groupbox-title">Leave Details — تفاصيل الإجازة</span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
            <WinField label="Start Date — تاريخ البداية *">
              <input
                className="win-input"
                style={{ width: '100%', height: 22 }}
                type="date"
                value={form.startDate}
                onChange={(e) => updateForm('startDate', e.target.value)}
                required
              />
            </WinField>
            <WinField label="End Date — تاريخ النهاية *">
              <input
                className="win-input"
                style={{ width: '100%', height: 22 }}
                type="date"
                value={form.endDate}
                onChange={(e) => updateForm('endDate', e.target.value)}
                required
              />
            </WinField>
          </div>

          <WinField label="Leave Type — نوع الإجازة *">
            <select
              className="win-select"
              style={{ width: '100%', height: 22 }}
              value={form.leaveType}
              onChange={(e) => updateForm('leaveType', e.target.value)}
              required
            >
              <option value="">— Select / اختر —</option>
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.labelFr}
                </option>
              ))}
            </select>
          </WinField>

          <WinField label="Notes — ملاحظات" style={{ marginTop: 6 }}>
            <textarea
              className="win-input"
              style={{ width: '100%', height: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 11 }}
              placeholder="أضف ملاحظاتك هنا..."
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </WinField>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button
            type="button"
            className="win-btn"
            onClick={() => navigateTo('landing')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="win-btn win-btn-primary"
            disabled={loading}
            style={{ minWidth: 100 }}
          >
            {loading ? '⏳ Submitting...' : '✓ Submit — تقديم'}
          </button>
        </div>
      </form>

      <div className="win-statusbar" style={{ marginTop: 8 }}>
        <div className="win-statusbar-pane" style={{ flex: 1 }}>
          {loading ? 'Submitting request...' : 'Fill in the form and click Submit'}
        </div>
      </div>
    </WinWindow>
  )
}

// ─── WinField Helper ──────────────────────────────────────────────────────────
function WinField({
  label,
  children,
  style,
}: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      <label style={{ fontSize: 11, color: '#000' }}>{label}</label>
      {children}
    </div>
  )
}

// ─── View 3: Confirmation ────────────────────────────────────────────────────
function ConfirmationView({
  request,
  navigateTo,
}: {
  request: LeaveRequest | null
  navigateTo: (v: View) => void
}) {
  return (
    <WinWindow title="Request Submitted — تم تقديم الطلب" icon="✅">
      {/* Success dialog box style */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 4px', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>✅</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>
            تم تقديم الطلب بنجاح! — Request submitted successfully!
          </div>
          <div style={{ fontSize: 11, color: '#444' }}>
            يمكنك تتبع طلبك باستخدام الاسم أو رقم الهاتف.
            <br />
            You can track your request using your name or phone number.
          </div>
        </div>
      </div>

      {/* Request details panel */}
      {request && (
        <div className="win-groupbox" style={{ marginBottom: 10 }}>
          <span className="win-groupbox-title">Request Details — تفاصيل الطلب</span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <tbody>
              <WinTableRow label="Request ID" value={<span style={{ fontFamily: 'monospace', fontSize: 10 }}>{request.id.slice(0, 20)}...</span>} />
              <WinTableRow label="Name — الاسم" value={request.name} />
              <WinTableRow label="Type — النوع" value={getLeaveTypeLabel(request.leaveType)} />
              <WinTableRow label="From — من" value={formatDate(request.startDate)} />
              <WinTableRow label="To — إلى" value={formatDate(request.endDate)} />
              <WinTableRow label="Status" value={getStatusBadge(request.status)} />
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
        <button className="win-btn" onClick={() => navigateTo('track')}>
          🔍 Track Request
        </button>
        <button className="win-btn" onClick={() => navigateTo('form')}>
          📝 New Request
        </button>
        <button className="win-btn win-btn-primary" onClick={() => navigateTo('landing')}>
          🏠 Home — الرئيسية
        </button>
      </div>
    </WinWindow>
  )
}

function WinTableRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr>
      <td style={{ padding: '2px 8px 2px 0', color: '#444', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{label}:</td>
      <td style={{ padding: '2px 0', fontWeight: 500, verticalAlign: 'top' }}>{value}</td>
    </tr>
  )
}

// ─── View 4: Track ────────────────────────────────────────────────────────────
function TrackView({ navigateTo }: { navigateTo: (v: View) => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error('يرجى إدخال اسم أو رقم هاتف أو رقم موظف')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(searchQuery.trim())}`)
      if (!res.ok) throw new Error('حدث خطأ أثناء البحث')
      const data: LeaveRequest[] = await res.json()
      setResults(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <WinWindow
      title="Track Leave Request — تتبع الطلب"
      icon="🔍"
      onClose={() => navigateTo('landing')}
    >
      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <input
          className="win-input"
          style={{ flex: 1, height: 22 }}
          type="text"
          placeholder="Search by name, phone, or employee ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="win-btn"
          disabled={loading}
          style={{ whiteSpace: 'nowrap' }}
        >
          {loading ? '⏳' : '🔍'} Search
        </button>
      </form>

      {/* Results in a listview-style panel */}
      <div className="win-inset" style={{ minHeight: 200, padding: 0, overflowY: 'auto', maxHeight: 380 }}>
        {loading && (
          <div style={{ padding: 12, color: '#808080', textAlign: 'center' }}>
            ⏳ Searching...
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#808080' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🔍</div>
            <div>No requests found — لم يتم العثور على طلبات</div>
          </div>
        )}

        {!loading && !searched && (
          <div style={{ padding: 12, color: '#808080', fontSize: 11 }}>
            Enter a search term and click Search.
          </div>
        )}

        {!loading && results.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#d4d0c8', position: 'sticky', top: 0 }}>
                {['Name', 'Type', 'Dates', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '2px 6px',
                      textAlign: 'left',
                      borderBottom: '1px solid #808080',
                      borderRight: '1px solid #d4d0c8',
                      fontWeight: 'bold',
                      fontSize: 11,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((req, i) => (
                <tr
                  key={req.id}
                  style={{ background: i % 2 === 0 ? '#ffffff' : '#f0f0f0' }}
                >
                  <td style={{ padding: '2px 6px', borderBottom: '1px solid #e0e0e0' }}>
                    <div>{req.name}</div>
                    {req.employeeId && <div style={{ color: '#808080', fontSize: 10 }}>#{req.employeeId}</div>}
                  </td>
                  <td style={{ padding: '2px 6px', borderBottom: '1px solid #e0e0e0' }}>
                    {getLeaveTypeLabel(req.leaveType)}
                  </td>
                  <td style={{ padding: '2px 6px', borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap' }}>
                    {formatDate(req.startDate)} → {formatDate(req.endDate)}
                  </td>
                  <td style={{ padding: '2px 6px', borderBottom: '1px solid #e0e0e0' }}>
                    {getStatusBadge(req.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {searched && results.length > 0 && (
        <div style={{ fontSize: 10, color: '#808080', marginTop: 4 }}>
          {results.length} record(s) found — تم العثور على {results.length} طلب
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="win-btn" onClick={() => navigateTo('landing')}>
          Close
        </button>
      </div>

      <div className="win-statusbar" style={{ marginTop: 8 }}>
        <div className="win-statusbar-pane" style={{ flex: 1 }}>
          {loading ? 'Searching...' : searched ? `${results.length} object(s)` : 'Ready'}
        </div>
      </div>
    </WinWindow>
  )
}

// ─── View 5: Login ────────────────────────────────────────────────────────────
function LoginView({
  navigateTo,
  onLogin,
}: {
  navigateTo: (v: View) => void
  onLogin: (user: HRUser) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { toast.error('يرجى إدخال البريد الإلكتروني'); return }
    if (!password) { toast.error('يرجى إدخال كلمة المرور'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'بيانات الدخول غير صحيحة')
      }
      const data: HRUser = await res.json()
      toast.success(`مرحباً ${data.name}!`)
      onLogin(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <WinWindow
      title="HR Login — تسجيل الدخول"
      icon="🔒"
      onClose={() => navigateTo('landing')}
    >
      {/* Dialog header with icon */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>🔒</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 12 }}>لوحة تحكم الموارد البشرية</div>
          <div style={{ fontSize: 11, color: '#444' }}>HR Dashboard — Tableau de bord RH</div>
        </div>
      </div>

      <div className="win-separator" />

      <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
        <div className="win-groupbox" style={{ marginBottom: 10 }}>
          <span className="win-groupbox-title">Credentials — بيانات الدخول</span>

          <WinField label="Email — البريد الإلكتروني">
            <input
              className="win-input"
              style={{ width: '100%', height: 22 }}
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </WinField>

          <WinField label="Password — كلمة المرور" style={{ marginTop: 6 }}>
            <input
              className="win-input"
              style={{ width: '100%', height: 22 }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </WinField>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button
            type="button"
            className="win-btn"
            onClick={() => navigateTo('landing')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="win-btn win-btn-primary"
            disabled={loading}
            style={{ minWidth: 80 }}
          >
            {loading ? '⏳ Logging in...' : '🔓 Login — دخول'}
          </button>
        </div>
      </form>
    </WinWindow>
  )
}

// ─── View 6: Dashboard ────────────────────────────────────────────────────────
function DashboardView({
  hrUser,
  navigateTo,
  onLogout,
}: {
  hrUser: HRUser | null
  navigateTo: (v: View) => void
  onLogout: () => void
}) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchName, setSearchName] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/leave-requests'),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (requestsRes.ok) setRequests(await requestsRes.json())
    } catch {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      const res = await fetch(`/api/leave-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'حدث خطأ')
      }
      toast.success(status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب')
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setActionLoading(null)
    }
  }

  if (!hrUser) {
    return (
      <WinWindow title="Access Denied" icon="🚫">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>يرجى تسجيل الدخول</div>
          <button className="win-btn win-btn-primary" onClick={() => navigateTo('login')}>
            Login — تسجيل الدخول
          </button>
        </div>
      </WinWindow>
    )
  }

  const filteredRequests = requests.filter((req) => {
    const matchesTab = activeTab === 'all' || req.status === activeTab
    const matchesSearch = !searchName.trim() ||
      req.name.toLowerCase().includes(searchName.trim().toLowerCase())
    return matchesTab && matchesSearch
  })

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all', label: `All (${requests.length})` },
    { key: 'pending', label: `Pending (${stats?.pending ?? 0})` },
    { key: 'approved', label: `Approved (${stats?.approved ?? 0})` },
    { key: 'rejected', label: `Rejected (${stats?.rejected ?? 0})` },
  ]

  return (
    <WinWindow title={`HR Dashboard — ${hrUser.name}`} icon="📊">
      {/* Menu bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: -4,
        background: '#d4d0c8',
        borderBottom: '1px solid #808080',
        paddingBottom: 4,
      }}>
        <div style={{ display: 'flex', gap: 0, fontSize: 11 }}>
          {['File', 'View', 'Actions'].map((m) => (
            <div key={m} className="win-listitem" style={{ padding: '2px 8px', cursor: 'default' }}>{m}</div>
          ))}
        </div>
        <button className="win-btn" style={{ height: 20, fontSize: 10, minWidth: 0, padding: '0 8px' }} onClick={onLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Stats toolbar */}
      {loading ? (
        <div style={{ color: '#808080', padding: '4px 0', fontSize: 11 }}>⏳ Loading data...</div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8 }}>
          {[
            { label: 'Total', value: stats.total, icon: '📋' },
            { label: 'Pending', value: stats.pending, icon: '⏳' },
            { label: 'Approved', value: stats.approved, icon: '✅' },
            { label: 'Rejected', value: stats.rejected, icon: '❌' },
          ].map((s) => (
            <div key={s.label} className="win-raised" style={{ padding: '4px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#444' }}>{s.label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Search */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        <input
          className="win-input"
          style={{ flex: 1, height: 22 }}
          type="text"
          placeholder="Search by name... — بحث بالاسم..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <button className="win-btn" onClick={fetchData} style={{ height: 22, minWidth: 0, padding: '0 8px' }}>
          🔄
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: -1 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`win-tab ${activeTab === tab.key ? 'win-tab-active' : 'win-tab-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content / listview */}
      <div className="win-inset" style={{ minHeight: 200, maxHeight: 320, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 12, color: '#808080', textAlign: 'center' }}>⏳ Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#808080' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📋</div>
            <div>No requests — لا توجد طلبات</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#d4d0c8' }}>
                {['Name', 'Type', 'Dates', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '2px 6px',
                      textAlign: 'left',
                      borderBottom: '2px solid #808080',
                      borderRight: '1px solid #d4d0c8',
                      fontSize: 11,
                      fontWeight: 'bold',
                      position: 'sticky',
                      top: 0,
                      background: '#d4d0c8',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, i) => (
                <tr
                  key={req.id}
                  style={{ background: i % 2 === 0 ? '#ffffff' : '#f5f5f5' }}
                >
                  <td style={{ padding: '3px 6px', borderBottom: '1px solid #e8e8e8', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 'bold' }}>{req.name}</div>
                    {req.employeeId && <div style={{ color: '#808080', fontSize: 10 }}>#{req.employeeId}</div>}
                    <div style={{ color: '#808080', fontSize: 10 }}>{formatDate(req.createdAt)}</div>
                  </td>
                  <td style={{ padding: '3px 6px', borderBottom: '1px solid #e8e8e8', verticalAlign: 'top', fontSize: 10 }}>
                    {getLeaveTypeLabel(req.leaveType)}
                  </td>
                  <td style={{ padding: '3px 6px', borderBottom: '1px solid #e8e8e8', verticalAlign: 'top', whiteSpace: 'nowrap', fontSize: 10 }}>
                    <div>{formatDate(req.startDate)}</div>
                    <div style={{ color: '#808080' }}>→ {formatDate(req.endDate)}</div>
                    {req.notes && (
                      <div style={{ color: '#808080', fontSize: 10, fontStyle: 'italic', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.notes}>
                        📝 {req.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '3px 6px', borderBottom: '1px solid #e8e8e8', verticalAlign: 'top' }}>
                    {getStatusBadge(req.status)}
                  </td>
                  <td style={{ padding: '3px 6px', borderBottom: '1px solid #e8e8e8', verticalAlign: 'top' }}>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <button
                          className="win-btn"
                          style={{ fontSize: 10, padding: '1px 6px', minWidth: 0, height: 18 }}
                          onClick={() => handleStatusChange(req.id, 'approved')}
                          disabled={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? '⏳' : '✓'} Approve
                        </button>
                        <button
                          className="win-btn"
                          style={{ fontSize: 10, padding: '1px 6px', minWidth: 0, height: 18, color: '#cc0000' }}
                          onClick={() => handleStatusChange(req.id, 'rejected')}
                          disabled={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? '⏳' : '✗'} Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="win-statusbar" style={{ marginTop: 8 }}>
        <div className="win-statusbar-pane" style={{ flex: 1 }}>
          {loading ? 'Loading...' : `${filteredRequests.length} object(s)`}
        </div>
        <div className="win-statusbar-pane">{hrUser.email}</div>
      </div>
    </WinWindow>
  )
}
