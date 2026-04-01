'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Send,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  BarChart3,
  LogOut,
  CalendarDays,
  User,
  Phone,
  Building2,
  ChevronDown,
  Loader2,
  Users,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Constants ───────────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  { value: 'sick', label: 'مرضية', labelFr: 'Sick Leave' },
  { value: 'annual', label: 'سنوية', labelFr: 'Annual Leave' },
  { value: 'emergency', label: 'طارئة', labelFr: 'Emergency' },
  { value: 'maternity', label: 'أمومة', labelFr: 'Maternity' },
  { value: 'unpaid', label: 'بدون راتب', labelFr: 'Unpaid' },
  { value: 'other', label: 'أخرى', labelFr: 'Other' },
] as const

const STATUS_CONFIG: Record<string, { label: string; labelFr: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'قيد المراجعة',
    labelFr: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: <Clock className="size-4" />,
  },
  approved: {
    label: 'موافق عليه',
    labelFr: 'Approved',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <CheckCircle2 className="size-4" />,
  },
  rejected: {
    label: 'مرفوض',
    labelFr: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: <XCircle className="size-4" />,
  },
}

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStatusBadge(status: string) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Badge variant="outline" className={`${config.color} gap-1.5 text-sm px-3 py-1`}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  )
}

function getLeaveTypeLabel(type: string) {
  const found = LEAVE_TYPES.find((t) => t.value === type)
  return found ? `${found.label} - ${found.labelFr}` : type
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

// ─── Main Component ──────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-gray-50" dir="ltr">
      <Toaster position="top-center" richColors closeButton />
      <div className="max-w-md mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div key="landing" {...PAGE_TRANSITION}>
              <LandingView navigateTo={navigateTo} />
            </motion.div>
          )}
          {currentView === 'form' && (
            <motion.div key="form" {...PAGE_TRANSITION}>
              <FormView
                navigateTo={navigateTo}
                onSubmitted={(req) => {
                  setSubmittedRequest(req)
                  navigateTo('confirmation')
                }}
              />
            </motion.div>
          )}
          {currentView === 'confirmation' && (
            <motion.div key="confirmation" {...PAGE_TRANSITION}>
              <ConfirmationView
                request={submittedRequest}
                navigateTo={navigateTo}
              />
            </motion.div>
          )}
          {currentView === 'track' && (
            <motion.div key="track" {...PAGE_TRANSITION}>
              <TrackView navigateTo={navigateTo} />
            </motion.div>
          )}
          {currentView === 'login' && (
            <motion.div key="login" {...PAGE_TRANSITION}>
              <LoginView
                navigateTo={navigateTo}
                onLogin={(user) => {
                  setHrUser(user)
                  localStorage.setItem('hr_user', JSON.stringify(user))
                  navigateTo('dashboard')
                }}
              />
            </motion.div>
          )}
          {currentView === 'dashboard' && (
            <motion.div key="dashboard" {...PAGE_TRANSITION}>
              <DashboardView
                hrUser={hrUser}
                navigateTo={navigateTo}
                onLogout={() => {
                  setHrUser(null)
                  localStorage.removeItem('hr_user')
                  toast.success('تم تسجيل الخروج بنجاح')
                  navigateTo('landing')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── View 1: Landing Page ────────────────────────────────────────────────────
function LandingView({ navigateTo }: { navigateTo: (v: View) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full flex flex-col items-center gap-8">
        {/* Logo / Icon */}
        <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
          <CalendarDays className="size-10 text-white" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">إدارة الإجازات</h1>
          <p className="text-lg text-gray-500">Gestion des Congés</p>
          <p className="text-sm text-gray-400">Leave Management System</p>
        </div>

        {/* QR Code */}
        <Card className="p-6 border-2 border-emerald-100 bg-white">
          <CardContent className="p-0 flex flex-col items-center gap-3">
            <QRCodeSVG
              value={typeof window !== 'undefined' ? window.location.href : ''}
              size={180}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#059669"
            />
            <p className="text-xs text-gray-400 text-center">
              امسح الرمز للوصول السريع
              <br />
              <span className="text-gray-300">Scannez pour accéder</span>
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <Button
            onClick={() => navigateTo('form')}
            className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md gap-3"
          >
            <Send className="size-5" />
            <span>طلب إجازة</span>
            <span className="text-emerald-200 text-sm">Demander un congé</span>
          </Button>

          <Button
            onClick={() => navigateTo('track')}
            variant="outline"
            className="w-full h-14 text-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-3"
          >
            <Search className="size-5" />
            <span>تتبع الطلب</span>
            <span className="text-emerald-400 text-sm">Suivre la demande</span>
          </Button>
        </div>

        {/* HR Link */}
        <Separator className="my-2 bg-gray-200" />

        <button
          onClick={() => navigateTo('login')}
          className="text-sm text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-2"
        >
          <ShieldCheck className="size-4" />
          <span>لوحة تحكم الموارد البشرية</span>
          <span className="text-gray-300">— Tableau de bord RH</span>
        </button>
      </div>
    </div>
  )
}

// ─── View 2: Leave Request Form ──────────────────────────────────────────────
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

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('يرجى إدخال الاسم الكامل')
      return
    }
    if (!form.startDate) {
      toast.error('يرجى تحديد تاريخ البداية')
      return
    }
    if (!form.endDate) {
      toast.error('يرجى تحديد تاريخ النهاية')
      return
    }
    if (!form.leaveType) {
      toast.error('يرجى اختيار نوع الإجازة')
      return
    }

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
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('landing')}
          className="h-12 w-12 rounded-xl"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلب إجازة</h1>
          <p className="text-sm text-gray-400">Demande de congé</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
            <User className="size-4 text-emerald-600" />
            الاسم الكامل <span className="text-red-500">*</span>
            <span className="text-gray-400 text-sm">— Nom complet</span>
          </Label>
          <Input
            type="text"
            placeholder="أدخل اسمك الكامل"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            className="h-14 text-lg rounded-xl"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
            <Phone className="size-4 text-emerald-600" />
            رقم الهاتف
            <span className="text-gray-400 text-sm">— Numéro de téléphone</span>
          </Label>
          <Input
            type="tel"
            placeholder="06XXXXXXXX"
            value={form.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
            className="h-14 text-lg rounded-xl"
          />
        </div>

        {/* Employee ID */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
            <Building2 className="size-4 text-emerald-600" />
            رقم الموظف
            <span className="text-gray-400 text-sm">— ID Employé</span>
          </Label>
          <Input
            type="text"
            placeholder="مثال: EMP-001"
            value={form.employeeId}
            onChange={(e) => updateForm('employeeId', e.target.value)}
            className="h-14 text-lg rounded-xl"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-700 flex items-center gap-1">
              <CalendarDays className="size-4 text-emerald-600" />
              تاريخ البداية <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => updateForm('startDate', e.target.value)}
              className="h-14 text-lg rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-700 flex items-center gap-1">
              <CalendarDays className="size-4 text-emerald-600" />
              تاريخ النهاية <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => updateForm('endDate', e.target.value)}
              className="h-14 text-lg rounded-xl"
              required
            />
          </div>
        </div>

        {/* Leave Type */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
            <FileText className="size-4 text-emerald-600" />
            نوع الإجازة <span className="text-red-500">*</span>
            <span className="text-gray-400 text-sm">— Type de congé</span>
          </Label>
          <Select value={form.leaveType} onValueChange={(v) => updateForm('leaveType', v)}>
            <SelectTrigger className="h-14 text-lg rounded-xl w-full">
              <SelectValue placeholder="اختر نوع الإجازة..." />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-base py-3">
                  {type.label} — {type.labelFr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
            ملاحظات
            <span className="text-gray-400 text-sm">— Notes</span>
          </Label>
          <Textarea
            placeholder="أضف ملاحظاتك هنا..."
            value={form.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            className="text-base rounded-xl min-h-[100px] p-4"
            rows={3}
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg gap-2"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
          {loading ? 'جاري التقديم...' : 'تقديم الطلب'}
        </Button>
      </form>
    </div>
  )
}

// ─── View 3: Submission Confirmation ──────────────────────────────────────────
function ConfirmationView({
  request,
  navigateTo,
}: {
  request: LeaveRequest | null
  navigateTo: (v: View) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="size-14 text-emerald-600" />
      </motion.div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        تم تقديم الطلب بنجاح!
      </h1>
      <p className="text-lg text-gray-500 mb-6">
        Demande soumise avec succès!
      </p>

      {/* Request ID Card */}
      {request && (
        <Card className="w-full border-2 border-emerald-100 bg-emerald-50/50 mb-6">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm text-gray-500">رقم الطلب — Numéro de demande</p>
            <p className="text-2xl font-bold text-emerald-700 font-mono break-all">
              {request.id}
            </p>
            <Separator className="bg-emerald-200" />
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>الاسم:</strong> {request.name}</p>
              <p><strong>النوع:</strong> {getLeaveTypeLabel(request.leaveType)}</p>
              <p><strong>من:</strong> {formatDate(request.startDate)} — <strong>إلى:</strong> {formatDate(request.endDate)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-base text-gray-500 mb-8">
        يمكنك تتبع طلبك باستخدام اسمك أو رقم الهاتف
        <br />
        <span className="text-gray-400 text-sm">
          Vous pouvez suivre votre demande avec votre nom ou numéro
        </span>
      </p>

      {/* Actions */}
      <div className="w-full space-y-3">
        <Button
          onClick={() => navigateTo('form')}
          className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
        >
          <Send className="size-5" />
          تقديم طلب آخر
        </Button>
        <Button
          onClick={() => navigateTo('track')}
          variant="outline"
          className="w-full h-12 text-base border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-2"
        >
          <Search className="size-5" />
          تتبع الطلب
        </Button>
        <Button
          onClick={() => navigateTo('landing')}
          variant="ghost"
          className="w-full h-11 text-base text-gray-500 rounded-xl"
        >
          الرئيسية — Accueil
        </Button>
      </div>
    </div>
  )
}

// ─── View 4: Status Tracking ─────────────────────────────────────────────────
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
      if (!res.ok) {
        throw new Error('حدث خطأ أثناء البحث')
      }
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
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('landing')}
          className="h-12 w-12 rounded-xl"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تتبع الطلب</h1>
          <p className="text-sm text-gray-400">Suivre la demande</p>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف أو رقم الموظف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 text-lg rounded-xl pl-11"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Search className="size-5" />
          )}
          {loading ? 'جاري البحث...' : 'بحث'}
        </Button>
      </form>

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">لم يتم العثور على طلبات</p>
          <p className="text-sm text-gray-400">Aucune demande trouvée</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            تم العثور على {results.length} طلب
            <span className="text-gray-400"> — {results.length} demande(s) trouvée(s)</span>
          </p>
          {results.map((req) => (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{req.name}</h3>
                    {req.employeeId && (
                      <p className="text-sm text-gray-500">
                        <Building2 className="size-3 inline mr-1" />
                        {req.employeeId}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(req.status)}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">النوع:</span>
                    <p className="font-medium text-gray-700">{getLeaveTypeLabel(req.leaveType)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">رقم الطلب:</span>
                    <p className="font-medium text-gray-700 font-mono text-xs break-all">{req.id.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <CalendarDays className="size-4 inline mr-1 text-emerald-600" />
                  <span className="font-medium">{formatDate(req.startDate)}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="font-medium">{formatDate(req.endDate)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── View 5: HR Login ────────────────────────────────────────────────────────
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
    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني')
      return
    }
    if (!password) {
      toast.error('يرجى إدخال كلمة المرور')
      return
    }

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Back Link */}
      <div className="w-full mb-8">
        <Button
          variant="ghost"
          onClick={() => navigateTo('landing')}
          className="text-gray-500 gap-2"
        >
          <ArrowLeft className="size-4" />
          العودة — Retour
        </Button>
      </div>

      {/* Logo */}
      <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
        <ShieldCheck className="size-8 text-white" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">لوحة تحكم الموارد البشرية</h1>
      <p className="text-base text-gray-400 mb-8">Tableau de bord RH</p>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">تسجيل الدخول</CardTitle>
          <CardDescription>Connexion</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">البريد الإلكتروني — Email</Label>
              <Input
                type="email"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">كلمة المرور — Mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base rounded-xl"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
              {loading ? 'جاري الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── View 6: HR Dashboard ────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab] = useState('all')
  const [searchName, setSearchName] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/leave-requests'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(requestsData)
      }
    } catch {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

      toast.success(
        status === 'approved' ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب'
      )
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesTab = activeTab === 'all' || req.status === activeTab
    const matchesSearch = !searchName.trim() ||
      req.name.toLowerCase().includes(searchName.trim().toLowerCase())
    return matchesTab && matchesSearch
  })

  // Redirect to login if not authenticated
  if (!hrUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <ShieldCheck className="size-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">يرجى تسجيل الدخول</h2>
        <Button onClick={() => navigateTo('login')} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
          تسجيل الدخول — Connexion
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="size-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">لوحة التحكم</h1>
            <p className="text-sm text-gray-400">{hrUser.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 rounded-xl"
        >
          <LogOut className="size-4" />
          <span className="text-sm">خروج</span>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 border-none bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <ClipboardList className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">الكل — Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-none bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">قيد المراجعة — Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-none bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-500">موافق — Approved</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border-none bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs text-gray-500">مرفوض — Rejected</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          type="text"
          placeholder="بحث بالاسم... — Recherche par nom..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="h-11 text-base rounded-xl pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-gray-100 rounded-xl p-1.5">
          <TabsTrigger value="all" className="flex-1 rounded-lg text-sm py-2">
            الكل
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 rounded-lg text-sm py-2 text-yellow-700 data-[state=active]:bg-yellow-100">
            قيد المراجعة
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-1 rounded-lg text-sm py-2 text-emerald-700 data-[state=active]:bg-emerald-100">
            موافق
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1 rounded-lg text-sm py-2 text-red-700 data-[state=active]:bg-red-100">
            مرفوض
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-500">لا توجد طلبات</p>
          <p className="text-sm text-gray-400">Aucune demande</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Name + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{req.name}</h3>
                    <p className="text-sm text-gray-400">
                      {req.employeeId && <span className="ml-2">#{req.employeeId}</span>}
                      {formatDate(req.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">النوع — Type</span>
                    <span className="font-medium text-gray-700">{getLeaveTypeLabel(req.leaveType)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">الفترة — Période</span>
                    <span className="font-medium text-gray-700">
                      {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </span>
                  </div>
                  {req.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">الهاتف — Tél</span>
                      <span className="font-medium text-gray-700">{req.phone}</span>
                    </div>
                  )}
                  {req.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-xs">ملاحظات — Notes:</span>
                      <p className="text-gray-600 mt-1">{req.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions for pending */}
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange(req.id, 'approved')}
                      disabled={actionLoading === req.id}
                      className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5"
                    >
                      {actionLoading === req.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      موافقة
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(req.id, 'rejected')}
                      disabled={actionLoading === req.id}
                      variant="outline"
                      className="flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 rounded-lg gap-1.5"
                    >
                      <XCircle className="size-4" />
                      رفض
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
