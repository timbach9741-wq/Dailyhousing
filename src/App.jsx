import { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
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

// --- 파트너(Vendor) 앱 컴포넌트 ---
const PartnerLayout = lazy(() => import('./layouts/PartnerLayout'))
const PartnerLogin = lazy(() => import('./pages/partner/PartnerLogin'))
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'))

// --- 모바일 명함 ---
const MobileBusinessCard = lazy(() => import('./pages/MobileBusinessCard'))

// Loading component
const PageLoader = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#d4a853] border-t-transparent"></div>
  </div>
)

function App() {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true)
  const location = useLocation()
  
  // 파트너(벤더) 전용 라우트인지 확인
  const isPartnerRoute = location.pathname.startsWith('/shinilsangjae')
  
  // 모바일 명함 라우트인지 확인
  const isCardRoute = location.pathname.startsWith('/card')

  // 공통 UI(헤더,푸터 등)를 숨겨야 하는 경로
  const isHideLayoutRoute = isPartnerRoute || isCardRoute;

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
      
      {/* 벤더 앱이나 모바일 명함에서는 Dailyhousing 공통 컴포넌트들을 숨김 */}
      {!isHideLayoutRoute && <ScrollToTop />}
      {!isHideLayoutRoute && <ScrollToTopButton />}
      {!isHideLayoutRoute && <KakaoChatButton />}
      {!isHideLayoutRoute && <Header />}
      
      <Toast />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* --- 파트너(Vendor) 전용 라우트 --- */}
            <Route path="/shinilsangjae" element={<PartnerLayout />}>
              <Route index element={<PartnerLogin />} />
              <Route path="login" element={<PartnerLogin />} />
              <Route path="dashboard" element={<PartnerDashboard />} />
            </Route>

            {/* --- 데일리하우징 모바일 명함 라우트 --- */}
            <Route path="/card" element={<MobileBusinessCard />} />
            <Route path="/card/:userId" element={<MobileBusinessCard />} />
            {/* --- Dailyhousing 기본 라우트 --- */}
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
      
      {/* 벤더 앱이나 명함 라우트에서는 Dailyhousing 푸터 숨김 */}
      {!isHideLayoutRoute && <Footer />}
    </div>
  )
}

export default App
