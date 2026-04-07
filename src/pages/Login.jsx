import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, resetPassword, findUserEmail } from '../services/authService';
import { useToastStore } from '../store/useToastStore';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToastStore();
  const from = location.state?.from?.pathname || '/';

  // 계정 찾기 모달 상태
  const [showFindModal, setShowFindModal] = useState(false);
  const [findName, setFindName] = useState('');
  const [findPhone, setFindPhone] = useState('');
  const [foundEmail, setFoundEmail] = useState('');
  const [findError, setFindError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      const user = result.user;
      // 관리자면 /admin으로, 아니면 원래 가려던 곳(from)으로 이동
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } else {
      // 승인 대기 상태 메시지 구분
      if (result.pendingApproval) {
        setError('가입 승인 대기 중입니다. 관리자 승인 후 이용 가능합니다.');
      } else {
        setError(result.error || '이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('비밀번호를 재설정할 이메일 주소를 입력해 주세요.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    if (result.success) {
      addToast('비밀번호 재설정 이메일이 발송되었습니다. 메일함을 확인해 주세요.');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleFindEmail = async (e) => {
    e.preventDefault();
    setFindError('');
    setFoundEmail('');

    if (!findName || !findPhone) {
      setFindError('이름과 휴대폰 번호를 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    const result = await findUserEmail(findName, findPhone);
    if (result.success) {
      // 이메일 마스킹 처리 (예: user@example.com -> us**@exa****.com)
      const [user, domain] = result.email.split('@');
      const maskedUser = user.length > 2 ? user.slice(0, 2) + '*'.repeat(user.length - 2) : user + '*';
      const [domainName, ext] = domain.split('.');
      const maskedDomain = domainName.slice(0, 2) + '*'.repeat(domainName.length - 2);
      const maskedEmail = `${maskedUser}@${maskedDomain}.${ext}`;

      setFoundEmail(maskedEmail);
      setEmail(result.email); // 찾은 이메일을 로그인 이메일 필드에 자동 입력
    } else {
      setFindError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Breadcrumb & Navigation */}
        <div className="login-navigation">
          <button
            onClick={() => navigate(-1)}
            className="back-button"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>뒤로가기</span>
          </button>
          <div className="breadcrumb">
            <Link to="/">홈</Link>
            <span className="separator">/</span>
            <span className="current">로그인</span>
          </div>
        </div>

        <h2 className="login-title">LOGIN</h2>
        <p className="login-subtitle">LX Z:IN 프리미엄 B2B 서비스에 로그인하세요.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">아이디 또는 이메일</label>
            <input
              id="email"
              type="text"
              placeholder="example@email.com 또는 아이디 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password-container">
            <button
              type="button"
              onClick={() => setShowFindModal(true)}
              className="find-account-link"
            >
              이메일을 잊으셨나요?
            </button>
            <span className="separator">|</span>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-btn"
            >
              비밀번호 재설정
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="login-footer">
          <p>계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
        </div>

        <div className="guest-order-section">
          <div className="benefit-box">
            <h4>회원 가입 혜택</h4>
            <ul>
              <li>• 주문 내역 상시 조회 및 배송 추적</li>
              <li>• 회원 전용 프로모션 및 할인 혜택</li>
              <li>• 1:1 맞춤형 인테리어 상담 서비스</li>
            </ul>
          </div>

          <button
            type="button"
            className="guest-order-btn"
            onClick={() => navigate('/cart')}
          >
            비회원으로 주문하기
          </button>

          <div className="mt-4">
            <Link to="/order-lookup" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1">
              이미 주문하셨나요? 비회원 주문 조회
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 이메일 찾기 모달 */}
      {showFindModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>이메일 찾기</h3>
              <button className="close-btn" onClick={() => {
                setShowFindModal(false);
                setFoundEmail('');
                setFindError('');
              }}>×</button>
            </div>

            {!foundEmail ? (
              <form onSubmit={handleFindEmail} className="modal-body">
                <p className="modal-desc">가입 시 입력하신 이름과 휴대폰 번호를 입력해 주세요.</p>
                <div className="form-group">
                  <label>성함</label>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={findName}
                    onChange={(e) => setFindName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>휴대폰 번호</label>
                  <input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={findPhone}
                    onChange={(e) => setFindPhone(e.target.value)}
                    required
                  />
                </div>
                {findError && <p className="modal-error">{findError}</p>}
                <button type="submit" className="modal-submit-btn" disabled={loading}>
                  {loading ? '조회 중...' : '이메일 확인'}
                </button>
              </form>
            ) : (
              <div className="modal-body success-body">
                <div className="success-icon">✓</div>
                <p className="success-msg">회원님의 정보와 일치하는 이메일입니다.</p>
                <div className="found-email-box">{foundEmail}</div>
                <p className="found-hint">보안을 위해 일부 정보가 기호(*)로 표시됩니다.</p>
                <button
                  className="modal-submit-btn"
                  onClick={() => setShowFindModal(false)}
                >
                  로그인하러 가기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: radial-gradient(circle at top right, #f8f9fa, #e9ecef);
          padding: 20px;
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          padding: 48px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          text-align: center;
          position: relative;
        }

        .login-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          color: #666;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          color: #a51c30;
          transform: translateX(-2px);
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: #999;
        }

        .breadcrumb a {
          color: #999;
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb a:hover {
          color: #666;
        }

        .breadcrumb .separator {
          margin: 0;
        }

        .breadcrumb .current {
          color: #333;
          font-weight: 600;
        }

        .login-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: #666;
          font-size: 0.95rem;
          margin-bottom: 40px;
        }

        .login-form {
          text-align: left;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-group input:focus {
          border-color: #a51c30;
          box-shadow: 0 0 0 4px rgba(165, 28, 48, 0.1);
        }

        .forgot-password-container {
          text-align: right;
          margin-bottom: 24px;
        }

        .forgot-password-btn {
          background: none;
          border: none;
          color: #a51c30;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .forgot-password-btn:hover {
          text-decoration: underline;
          color: #8e1829;
        }

        .error-message {
          color: #d93025;
          font-size: 0.85rem;
          margin-bottom: 16px;
          background: rgba(217, 48, 37, 0.05);
          padding: 10px;
          border-radius: 8px;
        }

        .login-submit-btn {
          width: 100%;
          padding: 16px;
          background: #a51c30;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 8px;
        }

        .login-submit-btn:hover:not(:disabled) {
          background: #8e1829;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(165, 28, 48, 0.25);
        }

        .login-submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 32px;
          font-size: 0.9rem;
          color: #666;
        }

        .login-footer a {
          color: #a51c30;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        .guest-order-section {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid #eee;
        }

        .benefit-box {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          text-align: left;
        }

        .benefit-box h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .benefit-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefit-box li {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .guest-order-btn {
          width: 100%;
          padding: 14px;
          background: #fff;
          color: #1a1a1a;
          border: 1px solid #ddd;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .guest-order-btn:hover {
          background: #f8f9fa;
          border-color: #1a1a1a;
        }

        .find-account-link {
          background: none;
          border: none;
          color: #666;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .find-account-link:hover {
          color: #1a1a1a;
          text-decoration: underline;
        }

        .separator {
          margin: 0 10px;
          color: #ddd;
          font-size: 0.8rem;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          width: 90%;
          max-width: 400px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #333;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-desc {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .modal-submit-btn {
          width: 100%;
          padding: 14px;
          background: #a51c30;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
        }

        .modal-error {
          color: #d93025;
          font-size: 0.85rem;
          margin-top: 10px;
        }

        .success-body {
          text-align: center;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background: #e6f4ea;
          color: #1e8e3e;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 30px;
          margin: 0 auto 20px;
        }

        .success-msg {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .found-email-box {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
          font-family: monospace;
          font-size: 1.1rem;
          font-weight: 700;
          color: #a51c30;
          margin-bottom: 8px;
        }

        .found-hint {
          font-size: 0.8rem;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default Login;
