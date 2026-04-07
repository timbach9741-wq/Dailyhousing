import { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopButton from './components/ScrollToTopButton'
import KakaoChatButton from './components/KakaoChatButton'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import { checkFirebaseConnection } from './lib/firebase'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const ResidentialSheetCategory = lazy(() => import('./pages/ResidentialSheetCategory'))
const FlooringProductDetailView = lazy(() => import('./pages/FlooringProductDetailView'))
const CommercialLVTCategory = lazy(() => import('./pages/CommercialLVTCategory'))
const InteriorConsultationRequest = lazy(() => import('./pages/InteriorConsultationRequest'))
const UserBusinessRegistration = lazy(() => import('./pages/UserBusinessRegistration'))
const ShoppingCartCheckout = lazy(() => import('./pages/ShoppingCartCheckout'))
const MyPageOrderTracking = lazy(() => import('./pages/MyPageOrderTracking'))
const QuantityInquiry = lazy(() => import('./pages/QuantityInquiry'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const CaseStudies = lazy(() => import('./pages/CaseStudies'))
const ShoppingGuide = lazy(() => import('./pages/ShoppingGuide'))
const GuestOrderLookup = lazy(() => import('./pages/GuestOrderLookup'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const QualityAssurance = lazy(() => import('./pages/QualityAssurance'))
const FAQ = lazy(() => import('./pages/FAQ'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Loading component
const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d4a853] border-t-transparent"></div>
  </div>
)

function App() {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true)

  useEffect(() => {
    const check = async () => {
      const connected = await checkFirebaseConnection()
      setIsFirebaseConnected(connected)
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {!isFirebaseConnected && (
        <div className="bg-red-500 text-white text-center py-2 text-sm font-medium z-50 sticky top-0">
          ⚠️ 서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}
      <ScrollToTop />
      <ScrollToTopButton />
      <KakaoChatButton />
      <Header />
      <Toast />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/category/residential" element={<ResidentialSheetCategory />} />
            <Route path="/product/:id" element={<FlooringProductDetailView />} />
            <Route path="/category/commercial" element={<CommercialLVTCategory />} />
            <Route path="/consultations/new" element={<InteriorConsultationRequest />} />
            <Route path="/inquiry" element={<QuantityInquiry />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/shopping-guide" element={<ShoppingGuide />} />
            <Route path="/register" element={<Signup />} />
            <Route
              path="/cart"
              element={<ShoppingCartCheckout />}
            />
            <Route
              path="/mypage"
              element={
                <ProtectedRoute>
                  <MyPageOrderTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/order-lookup" element={<GuestOrderLookup />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/quality-assurance" element={<QualityAssurance />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  )
}

export default App
