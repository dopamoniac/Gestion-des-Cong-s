'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
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
  Lock,
  Zap,
} from 'lucide-react'

// ─── Language Type & Translations ──────────────────────────────────────────────
type Lang = 'fr' | 'ar'

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // ─── Landing ────────────────────────────
    'landing.title': 'Gestion des Congés',
    'landing.subtitle': 'Leave Management System',
    'landing.qrScan': 'Scannez pour accéder',
    'landing.ctaLeave': 'Demander un congé',
    'landing.ctaTrack': 'Suivre la demande',
    'landing.tagline': 'Simple pour les employés · Rapide pour les RH',
    'landing.hrPanel': 'Tableau de bord RH',

    // ─── Form ───────────────────────────────
    'form.title': 'Demande de congé',
    'form.sectionPersonal': 'Informations personnelles',
    'form.sectionLeave': 'Détails du congé',
    'form.name': 'Nom complet',
    'form.namePlaceholder': 'Entrez votre nom complet',
    'form.phone': 'Numéro de téléphone',
    'form.employeeId': 'ID Employé',
    'form.employeeIdPlaceholder': 'Ex: EMP-001',
    'form.optional': 'Optionnel',
    'form.startDate': 'Date de début',
    'form.endDate': 'Date de fin',
    'form.leaveType': 'Type de congé',
    'form.leaveTypePlaceholder': 'Choisir le type de congé...',
    'form.notes': 'Notes',
    'form.notesPlaceholder': 'Ajoutez vos notes ici...',
    'form.submit': 'Soumettre la demande',
    'form.submitting': 'Soumission en cours...',
    'form.err.name': 'Veuillez entrer le nom complet',
    'form.err.startDate': 'Veuillez sélectionner la date de début',
    'form.err.endDate': 'Veuillez sélectionner la date de fin',
    'form.err.leaveType': 'Veuillez choisir le type de congé',
    'form.err.submit': 'Erreur lors de la soumission',
    'form.err.unexpected': 'Une erreur inattendue est survenue',
    'form.success': 'Demande soumise avec succès!',

    // ─── Confirmation ───────────────────────
    'confirm.title': 'Demande soumise avec succès!',
    'confirm.requestId': 'Numéro de demande',
    'confirm.name': 'Nom',
    'confirm.type': 'Type',
    'confirm.from': 'De',
    'confirm.to': 'À',
    'confirm.hint': 'Vous pouvez suivre votre demande avec votre nom ou numéro',
    'confirm.submitAnother': 'Soumettre une autre demande',
    'confirm.track': 'Suivre la demande',
    'confirm.home': 'Accueil',

    // ─── Track ──────────────────────────────
    'track.title': 'Suivre la demande',
    'track.placeholder': 'Rechercher par nom, téléphone ou ID...',
    'track.search': 'Rechercher',
    'track.searching': 'Recherche en cours...',
    'track.noResults': 'Aucune demande trouvée',
    'track.found': '{count} demande(s) trouvée(s)',
    'track.type': 'Type',
    'track.requestId': 'N° de demande',
    'track.err.empty': 'Veuillez entrer un nom, téléphone ou ID',
    'track.err.search': 'Erreur lors de la recherche',

    // ─── Login ──────────────────────────────
    'login.title': 'Tableau de bord RH',
    'login.subtitle': 'Espace administrateur',
    'login.back': 'Retour',
    'login.cardTitle': 'Connexion',
    'login.email': 'Email',
    'login.password': 'Mot de passe',
    'login.submit': 'Connexion',
    'login.loggingIn': 'Connexion en cours...',
    'login.secure': 'Connexion sécurisée',
    'login.welcome': 'Bienvenue',
    'login.err.email': "Veuillez entrer l'email",
    'login.err.password': 'Veuillez entrer le mot de passe',
    'login.err.invalid': 'Identifiants incorrects',
    'login.err.unexpected': 'Une erreur inattendue est survenue',

    // ─── Dashboard ──────────────────────────
    'dash.title': 'Tableau de bord',
    'dash.logout': 'Déconnexion',
    'dash.total': 'Total',
    'dash.pending': 'En attente',
    'dash.approved': 'Approuvé',
    'dash.rejected': 'Rejeté',
    'dash.search': 'Recherche par nom...',
    'dash.all': 'Tous',
    'dash.noRequests': 'Aucune demande',
    'dash.type': 'Type',
    'dash.period': 'Période',
    'dash.phone': 'Tél',
    'dash.notes': 'Notes',
    'dash.approve': 'Approuver',
    'dash.reject': 'Rejeter',
    'dash.loginRequired': 'Veuillez vous connecter',
    'dash.login': 'Connexion',
    'dash.toast.approved': 'Demande approuvée',
    'dash.toast.rejected': 'Demande rejetée',
    'dash.err.data': 'Erreur lors du chargement des données',
    'dash.err.unexpected': 'Une erreur inattendue est survenue',
    'dash.toast.logout': 'Déconnexion réussie',

    // ─── Leave Types ────────────────────────
    'leaveType.sick': 'Congé maladie',
    'leaveType.annual': 'Congé annuel',
    'leaveType.emergency': 'Urgence',
    'leaveType.maternity': 'Maternité',
    'leaveType.unpaid': 'Sans solde',
    'leaveType.other': 'Autre',

    // ─── Status ─────────────────────────────
    'status.pending': 'En attente',
    'status.approved': 'Approuvé',
    'status.rejected': 'Rejeté',
  },
  ar: {
    // ─── Landing ────────────────────────────
    'landing.title': 'إدارة الإجازات',
    'landing.subtitle': 'نظام إدارة الإجازات',
    'landing.qrScan': 'امسح الرمز للوصول السريع',
    'landing.ctaLeave': 'طلب إجازة',
    'landing.ctaTrack': 'تتبع الطلب',
    'landing.tagline': 'سهل للموظفين · سريع للموارد البشرية',
    'landing.hrPanel': 'لوحة تحكم الموارد البشرية',

    // ─── Form ───────────────────────────────
    'form.title': 'طلب إجازة',
    'form.sectionPersonal': 'معلومات شخصية',
    'form.sectionLeave': 'تفاصيل الإجازة',
    'form.name': 'الاسم الكامل',
    'form.namePlaceholder': 'أدخل اسمك الكامل',
    'form.phone': 'رقم الهاتف',
    'form.employeeId': 'رقم الموظف',
    'form.employeeIdPlaceholder': 'مثال: EMP-001',
    'form.optional': 'اختياري',
    'form.startDate': 'تاريخ البداية',
    'form.endDate': 'تاريخ النهاية',
    'form.leaveType': 'نوع الإجازة',
    'form.leaveTypePlaceholder': 'اختر نوع الإجازة...',
    'form.notes': 'ملاحظات',
    'form.notesPlaceholder': 'أضف ملاحظاتك هنا...',
    'form.submit': 'تقديم الطلب',
    'form.submitting': 'جاري التقديم...',
    'form.err.name': 'يرجى إدخال الاسم الكامل',
    'form.err.startDate': 'يرجى تحديد تاريخ البداية',
    'form.err.endDate': 'يرجى تحديد تاريخ النهاية',
    'form.err.leaveType': 'يرجى اختيار نوع الإجازة',
    'form.err.submit': 'حدث خطأ أثناء تقديم الطلب',
    'form.err.unexpected': 'حدث خطأ غير متوقع',
    'form.success': 'تم تقديم الطلب بنجاح!',

    // ─── Confirmation ───────────────────────
    'confirm.title': 'تم تقديم الطلب بنجاح!',
    'confirm.requestId': 'رقم الطلب',
    'confirm.name': 'الاسم',
    'confirm.type': 'النوع',
    'confirm.from': 'من',
    'confirm.to': 'إلى',
    'confirm.hint': 'يمكنك تتبع طلبك باستخدام اسمك أو رقم الهاتف',
    'confirm.submitAnother': 'تقديم طلب آخر',
    'confirm.track': 'تتبع الطلب',
    'confirm.home': 'الرئيسية',

    // ─── Track ──────────────────────────────
    'track.title': 'تتبع الطلب',
    'track.placeholder': 'ابحث بالاسم أو رقم الهاتف أو رقم الموظف...',
    'track.search': 'بحث',
    'track.searching': 'جاري البحث...',
    'track.noResults': 'لم يتم العثور على طلبات',
    'track.found': '{count} طلب تم العثور عليها',
    'track.type': 'النوع',
    'track.requestId': 'رقم الطلب',
    'track.err.empty': 'يرجى إدخال اسم أو رقم هاتف أو رقم موظف',
    'track.err.search': 'حدث خطأ أثناء البحث',

    // ─── Login ──────────────────────────────
    'login.title': 'لوحة تحكم الموارد البشرية',
    'login.subtitle': 'مساحة الإدارة',
    'login.back': 'العودة',
    'login.cardTitle': 'تسجيل الدخول',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.submit': 'دخول',
    'login.loggingIn': 'جاري الدخول...',
    'login.secure': 'اتصال آمن',
    'login.welcome': 'مرحباً',
    'login.err.email': 'يرجى إدخال البريد الإلكتروني',
    'login.err.password': 'يرجى إدخال كلمة المرور',
    'login.err.invalid': 'بيانات الدخول غير صحيحة',
    'login.err.unexpected': 'حدث خطأ غير متوقع',

    // ─── Dashboard ──────────────────────────
    'dash.title': 'لوحة التحكم',
    'dash.logout': 'خروج',
    'dash.total': 'الكل',
    'dash.pending': 'قيد المراجعة',
    'dash.approved': 'موافق عليه',
    'dash.rejected': 'مرفوض',
    'dash.search': 'بحث بالاسم...',
    'dash.all': 'الكل',
    'dash.noRequests': 'لا توجد طلبات',
    'dash.type': 'النوع',
    'dash.period': 'الفترة',
    'dash.phone': 'الهاتف',
    'dash.notes': 'ملاحظات',
    'dash.approve': 'موافقة',
    'dash.reject': 'رفض',
    'dash.loginRequired': 'يرجى تسجيل الدخول',
    'dash.login': 'تسجيل الدخول',
    'dash.toast.approved': 'تمت الموافقة على الطلب',
    'dash.toast.rejected': 'تم رفض الطلب',
    'dash.err.data': 'حدث خطأ أثناء تحميل البيانات',
    'dash.err.unexpected': 'حدث خطأ غير متوقع',
    'dash.toast.logout': 'تم تسجيل الخروج بنجاح',

    // ─── Leave Types ────────────────────────
    'leaveType.sick': 'مرضية',
    'leaveType.annual': 'سنوية',
    'leaveType.emergency': 'طارئة',
    'leaveType.maternity': 'أمومة',
    'leaveType.unpaid': 'بدون راتب',
    'leaveType.other': 'أخرى',

    // ─── Status ─────────────────────────────
    'status.pending': 'قيد المراجعة',
    'status.approved': 'موافق عليه',
    'status.rejected': 'مرفوض',
  },
}

// ─── Language Context ─────────────────────────────────────────────────────────
const LanguageCtx = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}>({
  lang: 'fr',
  setLang: () => {},
  t: (key: string) => key,
})

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
  { value: 'sick', key: 'leaveType.sick', label: 'مرضية', labelFr: 'Congé maladie' },
  { value: 'annual', key: 'leaveType.annual', label: 'سنوية', labelFr: 'Congé annuel' },
  { value: 'emergency', key: 'leaveType.emergency', label: 'طارئة', labelFr: 'Urgence' },
  { value: 'maternity', key: 'leaveType.maternity', label: 'أمومة', labelFr: 'Maternité' },
  { value: 'unpaid', key: 'leaveType.unpaid', label: 'بدون راتب', labelFr: 'Sans solde' },
  { value: 'other', key: 'leaveType.other', label: 'أخرى', labelFr: 'Autre' },
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
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStatusBadge(status: string, lang: Lang) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <Badge variant="outline" className={`${config.color} badge-premium gap-1.5 text-sm px-3 py-1 rounded-full`}>
      {config.icon}
      <span>{lang === 'ar' ? config.label : config.labelFr}</span>
    </Badge>
  )
}

function getLeaveTypeLabel(type: string, lang: Lang) {
  const found = LEAVE_TYPES.find((t) => t.value === type)
  return found ? (lang === 'ar' ? found.label : found.labelFr) : type
}

function formatDate(dateStr: string, lang: Lang) {
  try {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatRequestId(id: string): string {
  const clean = id.replace(/-/g, '').toUpperCase()
  if (clean.length >= 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.length > 8 ? clean.slice(8) : ''}`
  }
  return clean
}

// ─── Language Switcher ───────────────────────────────────────────────────────
function LanguageSwitcher() {
  const { lang, setLang } = useContext(LanguageCtx)
  return (
    <div className="flex items-center justify-end px-4 pt-3 pb-1">
      <button
        onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
        className="flex items-center gap-0.5 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/60 p-0.5 shadow-sm hover:shadow-md transition-all duration-300"
      >
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
          lang === 'fr'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-600'
        }`}>
          FR
        </span>
        <span className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
          lang === 'ar'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-gray-400 hover:text-gray-600'
        }`}>
          AR
        </span>
      </button>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Home() {
  const [currentView, setCurrentView] = useState<View>('landing')
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app_lang')
        if (stored === 'ar' || stored === 'fr') return stored
      } catch { /* ignore */ }
    }
    return 'fr'
  })
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

  const handleSetLang = useCallback((l: Lang) => {
    setLang(l)
    localStorage.setItem('app_lang', l)
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let text = translations[lang][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }, [lang])

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view)
    window.scrollTo(0, 0)
  }, [])

  return (
    <LanguageCtx.Provider value={{ lang, setLang: handleSetLang, t }}>
      <div className="min-h-screen premium-bg relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Ambient mesh orbs for depth */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="mesh-orb absolute top-[10%] -left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-200/20 blur-[80px]" />
          <div className="mesh-orb-delay absolute -bottom-[10%] -right-[15%] w-[400px] h-[400px] rounded-full bg-teal-200/15 blur-[80px]" />
          <div className="mesh-orb-delay-2 absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-emerald-100/10 blur-[60px]" />
        </div>

        <Toaster position="top-center" richColors closeButton />
        <div className="relative z-10 max-w-md mx-auto min-h-screen">
          <LanguageSwitcher />
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
                    toast.success(t('dash.toast.logout'))
                    navigateTo('landing')
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LanguageCtx.Provider>
  )
}

// ─── View 1: Landing Page ────────────────────────────────────────────────────
function LandingView({ navigateTo }: { navigateTo: (v: View) => void }) {
  const { lang, t } = useContext(LanguageCtx)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        className="w-full flex flex-col items-center gap-8"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Logo / Icon */}
        <motion.div variants={fadeUp} className="relative">
          <div className="absolute inset-[-8px] bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 rounded-[1.5rem] blur-xl opacity-40" />
          <div className="absolute inset-[-2px] bg-gradient-to-br from-emerald-400 via-teal-300 to-emerald-500 rounded-[1.25rem] opacity-60" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg glow-emerald">
            <CalendarDays className="size-10 text-white drop-shadow-sm" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-800 bg-clip-text text-transparent glow-text-emerald">
            {t('landing.title')}
          </h1>
          <p className="text-lg text-gray-500 font-medium">{t('landing.subtitle')}</p>
        </motion.div>

        {/* QR Code */}
        <motion.div variants={fadeUp} className="w-full">
          <div className="relative gradient-border rounded-2xl">
            <div className="glass-card rounded-2xl p-6">
              <CardContent className="p-0 flex flex-col items-center gap-3">
                <div className="w-[180px] h-[180px] bg-white rounded-xl p-2 shadow-inner">
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    size={148}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#059669"
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-1">
                  {t('landing.qrScan')}
                </p>
              </CardContent>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeUp} className="w-full space-y-4">
          <Button
            onClick={() => navigateTo('form')}
            className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-[0_4px_14px_-3px_rgba(5,150,105,0.4)] gap-3 btn-premium"
          >
            <Send className="size-5" />
            <span>{t('landing.ctaLeave')}</span>
          </Button>

          <Button
            onClick={() => navigateTo('track')}
            variant="outline"
            className="w-full h-14 text-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-3 btn-premium glass-card"
          >
            <Search className="size-5" />
            <span>{t('landing.ctaTrack')}</span>
          </Button>

          <p className="text-center text-[11px] text-gray-300 tracking-wide pt-1">
            {t('landing.tagline')}
          </p>
        </motion.div>

        {/* HR Link */}
        <motion.div variants={fadeUp} className="w-full">
          <div className="relative">
            <Separator className="my-3 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <button
            onClick={() => navigateTo('login')}
            className="text-sm text-gray-400 hover:text-emerald-600 opacity-60 hover:opacity-100 transition-all duration-300 flex items-center gap-2 group"
          >
            <ShieldCheck className="size-4 group-hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.4)] transition-all duration-300" />
            <span>{t('landing.hrPanel')}</span>
          </button>
        </motion.div>
      </motion.div>
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
  const { lang, t } = useContext(LanguageCtx)
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
      toast.error(t('form.err.name'))
      return
    }
    if (!form.startDate) {
      toast.error(t('form.err.startDate'))
      return
    }
    if (!form.endDate) {
      toast.error(t('form.err.endDate'))
      return
    }
    if (!form.leaveType) {
      toast.error(t('form.err.leaveType'))
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
        throw new Error(err.error || t('form.err.submit'))
      }

      const data: LeaveRequest = await res.json()
      toast.success(t('form.success'))
      onSubmitted(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('form.err.unexpected'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#f8fafb] via-[#f8fafb]/90 to-transparent backdrop-blur-sm pb-4 pt-1 mb-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo('landing')}
            className="h-12 w-12 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('form.title')}</h1>
          </div>
          {/* Visual step indicator (no state change) */}
          <div className="ms-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="w-8 h-1 rounded-full bg-emerald-200" />
            <div className="w-2 h-2 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <Card className="glass-card-elevated shadow-sm">
        <CardContent className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section: Personal Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="size-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">{t('form.sectionPersonal')}</span>
              </div>

              {/* Name */}
              <div className="space-y-2 mb-5">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <User className="size-4 text-emerald-600" />
                  {t('form.name')} <span className="text-red-500">*</span>
                </Label>
                <div className="premium-input rounded-xl">
                  <Input
                    type="text"
                    placeholder={t('form.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2 mb-5">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="size-4 text-emerald-600" />
                  {t('form.phone')}
                </Label>
                <div className="premium-input rounded-xl">
                  <Input
                    type="tel"
                    placeholder="06XXXXXXXX"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                  />
                </div>
                <p className="text-[11px] text-gray-300 ps-1">{t('form.optional')}</p>
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="size-4 text-emerald-600" />
                  {t('form.employeeId')}
                </Label>
                <div className="premium-input rounded-xl">
                  <Input
                    type="text"
                    placeholder={t('form.employeeIdPlaceholder')}
                    value={form.employeeId}
                    onChange={(e) => updateForm('employeeId', e.target.value)}
                    className="h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                  />
                </div>
                <p className="text-[11px] text-gray-300 ps-1">{t('form.optional')}</p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-emerald-100 to-transparent" />

            {/* Section: Leave Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CalendarDays className="size-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">{t('form.sectionLeave')}</span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end mb-5">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700 flex items-center gap-1">
                    <CalendarDays className="size-4 text-emerald-600" />
                    {t('form.startDate')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="premium-input rounded-xl">
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => updateForm('startDate', e.target.value)}
                      className="h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>
                <div className="pb-2 text-emerald-400 text-lg font-medium">→</div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-gray-700 flex items-center gap-1">
                    <CalendarDays className="size-4 text-emerald-600" />
                    {t('form.endDate')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="premium-input rounded-xl">
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => updateForm('endDate', e.target.value)}
                      className="h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Leave Type */}
              <div className="space-y-2 mb-5">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="size-4 text-emerald-600" />
                  {t('form.leaveType')} <span className="text-red-500">*</span>
                </Label>
                <div className="premium-input rounded-xl">
                  <Select value={form.leaveType} onValueChange={(v) => updateForm('leaveType', v)}>
                    <SelectTrigger className="h-14 text-lg rounded-xl w-full border-gray-200 focus:border-emerald-400 focus:ring-emerald-100">
                      <SelectValue placeholder={t('form.leaveTypePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-base py-3">
                          {lang === 'ar' ? type.label : type.labelFr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                  {t('form.notes')}
                </Label>
                <div className="premium-input rounded-xl">
                  <Textarea
                    placeholder={t('form.notesPlaceholder')}
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    className="text-base rounded-xl min-h-[100px] p-4 border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                    rows={3}
                  />
                </div>
                <p className="text-[11px] text-gray-300 ps-1">{t('form.optional')}</p>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-[0_4px_14px_-3px_rgba(5,150,105,0.5)] gap-2 btn-premium"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
              {loading ? t('form.submitting') : t('form.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
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
  const { lang, t } = useContext(LanguageCtx)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      {/* Multi-ring glow success icon */}
      <div className="relative mb-8">
        {/* Outer pulse ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ delay: 0.3, duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-[-16px] rounded-full border-2 border-emerald-300/30"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ delay: 0.6, duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-[-24px] rounded-full border border-emerald-200/20"
        />
        {/* Main success circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-28 h-28 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center ring-4 ring-emerald-200/50 ring-offset-4 ring-offset-white shadow-[0_0_40px_rgba(16,185,129,0.15)]"
        >
          <CheckCircle2 className="size-14 text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-gray-900 mb-2"
      >
        {t('confirm.title')}
      </motion.h1>

      {/* Request ID Card */}
      {request && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full mb-6"
        >
          <div className="relative gradient-border rounded-2xl glow-emerald-soft">
            <Card className="rounded-2xl bg-white shadow-sm">
              <CardContent className="p-6 text-center space-y-4">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{t('confirm.requestId')}</p>
                <div className="bg-emerald-50/50 rounded-xl py-3 px-4">
                  <p className="text-xl font-bold text-emerald-700 font-mono tracking-widest">
                    REQ-{formatRequestId(request.id)}
                  </p>
                </div>
                <Separator className="bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
                <div className="text-sm text-gray-600 space-y-2.5">
                  <p className="flex items-center justify-center gap-2">
                    <User className="size-3.5 text-emerald-500" />
                    <strong>{t('confirm.name')}:</strong> {request.name}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <FileText className="size-3.5 text-emerald-500" />
                    <strong>{t('confirm.type')}:</strong> {getLeaveTypeLabel(request.leaveType, lang)}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <CalendarDays className="size-3.5 text-emerald-500" />
                    <strong>{t('confirm.from')}:</strong> {formatDate(request.startDate, lang)} — <strong>{t('confirm.to')}:</strong> {formatDate(request.endDate, lang)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-base text-gray-500 mb-8"
      >
        {t('confirm.hint')}
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full space-y-3"
      >
        <Button
          onClick={() => navigateTo('form')}
          className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-[0_4px_14px_-3px_rgba(5,150,105,0.4)] gap-2 btn-premium"
        >
          <Send className="size-5" />
          {t('confirm.submitAnother')}
        </Button>
        <Button
          onClick={() => navigateTo('track')}
          variant="outline"
          className="w-full h-12 text-base border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl gap-2 btn-premium glass-card"
        >
          <Search className="size-5" />
          {t('confirm.track')}
        </Button>
        <Button
          onClick={() => navigateTo('landing')}
          variant="ghost"
          className="w-full h-11 text-base text-gray-500 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {t('confirm.home')}
        </Button>
      </motion.div>
    </div>
  )
}

// ─── View 4: Status Tracking ─────────────────────────────────────────────────
function TrackView({ navigateTo }: { navigateTo: (v: View) => void }) {
  const { lang, t } = useContext(LanguageCtx)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      toast.error(t('track.err.empty'))
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(searchQuery.trim())}`)
      if (!res.ok) {
        throw new Error(t('track.err.search'))
      }
      const data: LeaveRequest[] = await res.json()
      setResults(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('form.err.unexpected'))
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
          className="h-12 w-12 rounded-xl hover:bg-emerald-50 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('track.title')}</h1>
        </div>
      </div>

      {/* Search Form */}
      <Card className="glass-card-elevated mb-6">
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <div className="premium-input rounded-xl">
                <Input
                  type="text"
                  placeholder={t('track.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 text-lg rounded-xl ps-11 border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl gap-2 shadow-[0_4px_14px_-3px_rgba(5,150,105,0.4)] btn-premium"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Search className="size-5" />
              )}
              {loading ? t('track.searching') : t('track.search')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading Skeletons with shimmer */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="glass-card overflow-hidden">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4 shimmer" />
                <Skeleton className="h-4 w-1/2 shimmer" />
                <Skeleton className="h-4 w-2/3 shimmer" />
                <Skeleton className="h-8 w-24 shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results - animated empty state */}
      {!loading && searched && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center"
            >
              <Search className="size-12 text-gray-300" />
            </motion.div>
          </div>
          <p className="text-lg text-gray-500 font-medium">{t('track.noResults')}</p>
        </motion.div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            {t('track.found', { count: results.length })}
          </p>
          {results.map((req) => (
            <Card key={req.id} className={`glass-card request-row overflow-hidden ${
              req.status === 'pending' ? 'border-s-4 border-s-amber-400' :
              req.status === 'approved' ? 'border-s-4 border-s-emerald-500' :
              req.status === 'rejected' ? 'border-s-4 border-s-red-400' : ''
            }`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{req.name}</h3>
                    {req.employeeId && (
                      <p className="text-sm text-gray-500">
                        <Building2 className="size-3 inline ms-1" />
                        {req.employeeId}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(req.status, lang)}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">{t('track.type')}:</span>
                    <p className="font-medium text-gray-700">{getLeaveTypeLabel(req.leaveType, lang)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">{t('track.requestId')}:</span>
                    <p className="font-medium text-gray-700 font-mono text-xs break-all">{req.id.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className="bg-emerald-50/50 rounded-lg p-3 text-sm">
                  <CalendarDays className="size-4 inline ms-1 text-emerald-600" />
                  <span className="font-medium">{formatDate(req.startDate, lang)}</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="font-medium">{formatDate(req.endDate, lang)}</span>
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
  const { lang, t } = useContext(LanguageCtx)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error(t('login.err.email'))
      return
    }
    if (!password) {
      toast.error(t('login.err.password'))
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
        throw new Error(err.error || t('login.err.invalid'))
      }

      const data: HRUser = await res.json()
      toast.success(`${t('login.welcome')} ${data.name}!`)
      onLogin(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('login.err.unexpected'))
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
          className="text-gray-500 gap-2 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="size-4" />
          {t('login.back')}
        </Button>
      </div>

      {/* Logo with animated gradient border */}
      <div className="relative mb-6">
        <div className="absolute inset-[-4px] bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 rounded-[1.5rem] opacity-50 blur-sm" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg glow-emerald">
          <ShieldCheck className="size-8 text-white drop-shadow-sm" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('login.title')}</h1>
      <p className="text-base text-gray-400 mb-8">{t('login.subtitle')}</p>

      <Card className="w-full glass-card-elevated shadow-xl shadow-emerald-900/5">
        <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('login.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-base font-medium">{t('login.email')}</Label>
              <div className="premium-input rounded-xl">
                <Input
                  type="email"
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">{t('login.password')}</Label>
              <div className="premium-input rounded-xl">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-100"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl gap-2 shadow-[0_4px_14px_-3px_rgba(5,150,105,0.5)] btn-premium"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ShieldCheck className="size-5" />
              )}
              {loading ? t('login.loggingIn') : t('login.submit')}
            </Button>

            {/* Secure connection trust indicator */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <Lock className="size-3 text-emerald-400" />
              <span className="text-[11px] text-gray-300">{t('login.secure')}</span>
            </div>
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
  const { lang, t } = useContext(LanguageCtx)
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
      toast.error(t('dash.err.data'))
    } finally {
      setLoading(false)
    }
  }, [t])

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
        throw new Error(err.error || 'Error')
      }

      toast.success(
        status === 'approved' ? t('dash.toast.approved') : t('dash.toast.rejected')
      )
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('dash.err.unexpected'))
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
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <ShieldCheck className="size-16 text-gray-300 mb-4" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">{t('dash.loginRequired')}</h2>
        <Button onClick={() => navigateTo('login')} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-[0_4px_14px_-3px_rgba(5,150,105,0.4)] btn-premium">
          {t('dash.login')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-gray-200/40 -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center glow-emerald-soft">
              <ShieldCheck className="size-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('dash.title')}</h1>
              <p className="text-sm text-gray-400">{hrUser.name}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 rounded-xl transition-colors"
          >
            <LogOut className="size-4" />
            <span className="text-sm">{t('dash.logout')}</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl shimmer" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="stat-card p-4 glass-card border border-gray-200/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                <ClipboardList className="size-5 text-slate-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">{t('dash.total')}</p>
              </div>
            </div>
          </Card>
          <Card className="stat-card p-4 glass-card border border-amber-200/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-yellow-50 rounded-xl flex items-center justify-center">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">{t('dash.pending')}</p>
              </div>
              {stats.pending > 0 && (
                <div className="ms-auto w-2.5 h-2.5 rounded-full bg-amber-400 pulse-soft" />
              )}
            </div>
          </Card>
          <Card className="stat-card p-4 glass-card border border-emerald-200/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-500">{t('dash.approved')}</p>
              </div>
            </div>
          </Card>
          <Card className="stat-card p-4 glass-card border border-red-200/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-rose-50 rounded-xl flex items-center justify-center">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs text-gray-500">{t('dash.rejected')}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Search */}
      <div className="glass-card rounded-xl p-1.5 mb-4 glow-emerald-soft">
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-400" />
          <Input
            type="text"
            placeholder={t('dash.search')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="h-10 text-base rounded-lg ps-10 border-0 shadow-none focus-visible:ring-0 bg-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="w-full h-auto flex-wrap gap-1 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 shadow-sm border border-gray-200/40">
          <TabsTrigger value="all" className="flex-1 rounded-lg text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('dash.all')}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 rounded-lg text-sm py-2 text-yellow-700 data-[state=active]:bg-yellow-100 data-[state=active]:shadow-sm">
            {t('dash.pending')}
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-1 rounded-lg text-sm py-2 text-emerald-700 data-[state=active]:bg-emerald-100 data-[state=active]:shadow-sm">
            {t('dash.approved')}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1 rounded-lg text-sm py-2 text-red-700 data-[state=active]:bg-red-100 data-[state=active]:shadow-sm">
            {t('dash.rejected')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4 shimmer" />
                <Skeleton className="h-4 w-1/2 shimmer" />
                <Skeleton className="h-4 w-2/3 shimmer" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-9 w-20 shimmer" />
                  <Skeleton className="h-9 w-20 shimmer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center"
            >
              <ClipboardList className="size-12 text-gray-300" />
            </motion.div>
          </motion.div>
          <p className="text-lg text-gray-500 font-medium">{t('dash.noRequests')}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pe-1">
          {filteredRequests.map((req) => (
            <Card key={req.id} className={`glass-card request-row overflow-hidden ${
              req.status === 'pending' ? 'border-s-4 border-s-amber-400 ring-1 ring-amber-200/50' :
              req.status === 'approved' ? 'border-s-4 border-s-emerald-500' :
              req.status === 'rejected' ? 'border-s-4 border-s-red-400' : ''
            }`}>
              <CardContent className="p-4 space-y-3">
                {/* Name + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{req.name}</h3>
                      {req.status === 'pending' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 pulse-soft flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {req.employeeId && <span className="ms-2">#{req.employeeId}</span>}
                      {formatDate(req.createdAt, lang)}
                    </p>
                  </div>
                  {getStatusBadge(req.status, lang)}
                </div>

                {/* Details */}
                <div className="bg-emerald-50/40 rounded-xl p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('dash.type')}</span>
                    <span className="font-medium text-gray-700">{getLeaveTypeLabel(req.leaveType, lang)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('dash.period')}</span>
                    <span className="font-medium text-gray-700">
                      {formatDate(req.startDate, lang)} → {formatDate(req.endDate, lang)}
                    </span>
                  </div>
                  {req.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('dash.phone')}</span>
                      <span className="font-medium text-gray-700">{req.phone}</span>
                    </div>
                  )}
                  {req.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-200/60">
                      <span className="text-gray-500 text-xs">{t('dash.notes')}:</span>
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
                      className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg gap-1.5 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.5)] btn-premium"
                    >
                      {actionLoading === req.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      {t('dash.approve')}
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(req.id, 'rejected')}
                      disabled={actionLoading === req.id}
                      variant="outline"
                      className="flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg gap-1.5 transition-all duration-200"
                    >
                      <XCircle className="size-4" />
                      {t('dash.reject')}
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
