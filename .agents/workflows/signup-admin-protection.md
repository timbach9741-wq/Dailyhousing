---
description: 사업자 회원가입 및 관리자 승인 시스템 - 코드 보호 규칙 (2026-03-23 확정, 2026-03-24 관리자 인증 보안 추가)
---

# 🔒 사업자 회원가입 & 관리자 승인 시스템 보호 규칙

> ⚠️ 아래 파일들은 2026-03-23 작업에서 완성된 핵심 기능입니다.
> **절대 임의 수정하지 마세요.** 수정이 필요하면 반드시 사용자에게 확인을 받으세요.

---

## 보호 대상 파일 및 핵심 로직

### 1. `src/services/authService.js`
- **signup 함수** (라인 163~): 개인/사업자 회원 분기 처리
  - 개인 회원: `approved: true` → 가입 즉시 로그인
  - 사업자 회원 (자동 승인): `ntsVerified && licenseUrl` → `approved: true` → 즉시 로그인
  - 사업자 회원 (수동 승인): 위 조건 미충족 → `approved: false` → 관리자 승인 대기, `signOut()` 호출
- **login 함수**: `approved === false` 체크로 미승인 회원 로그인 차단
- **🔑 관리자 인증 (2026-03-24 보안 전환 완료)**:
  - `initAuthListener`: `getIdTokenResult().claims.admin`으로 관리자 판별
  - `login`: `fbUser.getIdTokenResult()`로 Custom Claims 확인 후 role 설정
  - Firebase Custom Claims `{ admin: true }` → `timbach@naver.com` (UID: `1iLoazUNPKdCo5AaaiVE8KxCtht2`)
- **절대 변경하면 안 되는 것**:
  - `needsApproval` 분기 로직
  - `approved` 필드의 true/false 할당 기준
  - `signOut(auth)` 호출 위치 (사업자만)
  - ❌ 하드코딩 관리자 로그인 로직 **절대 다시 추가 금지** (이메일/비밀번호 하드코딩 X)
  - ❌ `getIdTokenResult().claims.admin` 로직 삭제 금지
  - ❌ 이메일 비교로 admin role 부여하는 코드 금지 (예: `email === 'xxx' ? 'admin'`)

### 2. `src/pages/Signup.jsx`
- **handleSubmit**: Firebase Storage 업로드 10초 타임아웃 + try-catch-finally
- **businessInfo 객체 필드명** (AdminDashboard와 반드시 일치):
  - `businessName` (상호명)
  - `businessNumber` (사업자등록번호)
  - `licenseUrl` (등록증 파일 URL)
  - `licenseFileName` (파일명)
  - `ntsVerified` (국세청 인증 여부)
- **절대 변경하면 안 되는 것**:
  - businessInfo 필드명 (AdminDashboard.jsx와 동기화됨)
  - 타임아웃 로직 (무한 로딩 방지)
  - finally 블록의 `setLoading(false)`

### 3. `src/pages/AdminDashboard.jsx`
- **회원 관리 테이블** (라인 1477~1560):
  - `사업자 정보` 컬럼: `u.businessInfo.businessName`, `u.businessInfo.businessNumber`, `u.businessInfo.licenseUrl`
  - 승인/거절 버튼: `u.approved === false` 조건으로 표시
- **회원 상세 모달** (라인 1610~1635):
  - 사업자명, 사업자번호, 등록증 파일 열기 버튼
- **절대 변경하면 안 되는 것**:
  - businessInfo 필드 참조명 (Signup.jsx와 동기화됨)
  - `handleApprove` / `handleReject` 함수 호출
  - colSpan 값 (컬럼 6개)

### 4. `src/services/googleSheetsService.js`
- Google Sheets 웹훅 호출 (회원가입 시 자동 기록)
- 필드명: `businessName`, `businessNumber`, `licenseUrl` (Signup.jsx와 동기화)
- **절대 변경하면 안 되는 것**:
  - fetch 호출의 `'Content-Type': 'text/plain'` (CORS 우회)
  - catch 블록 (실패해도 가입 진행 보장)

### 5. `src/services/businessVerifyService.js`
- 국세청 사업자번호 진위확인 API 호출
- 공공데이터포털 API Key: `.env`의 `VITE_NTS_SERVICE_KEY`

### 6. `.env` 환경변수
```
VITE_NTS_SERVICE_KEY=9a63374ab44c9ca6472e4b0e42643e8e7272416b3d8f80b479c2637f20eaf43f
VITE_GOOGLE_SHEETS_WEBHOOK=https://script.google.com/macros/s/AKfycby3aZMkAA2uAsS8N9CcnmKuJqzwXHgvMYVIMFj3b8d1tdJGs1I1vQ5Cj0sNAKDp6Lpukg/exec
```

---

## 필드명 동기화 규칙 (절대 불일치 금지)

| 필드 | Signup.jsx | AdminDashboard.jsx | googleSheetsService.js |
|------|-----------|-------------------|----------------------|
| 상호명 | `businessName` | `businessName` | `businessName` |
| 사업자번호 | `businessNumber` | `businessNumber` | `businessNumber` |
| 등록증 URL | `licenseUrl` | `licenseUrl` | `licenseUrl` |

### 7. `src/components/ProtectedRoute.jsx` (2026-03-24 추가)
- `adminOnly` prop으로 관리자 전용 페이지 보호
- `user.role !== 'admin'`이면 `/`로 리다이렉트
- **절대 변경하면 안 되는 것**:
  - `adminOnly && user?.role !== 'admin'` 체크 로직 삭제 금지
  - `useAuthStore`에서 `user` 구조분해 할당 제거 금지

### 8. `src/App.jsx` — `/admin` 라우트 (2026-03-24 추가)
- `<ProtectedRoute adminOnly>` 적용됨
- **절대 변경하면 안 되는 것**:
  - `/admin` 라우트의 `adminOnly` prop 제거 금지
  - `ProtectedRoute`를 일반 `ProtectedRoute`로 되돌리기 금지

---

## 수정 시 필수 체크리스트
1. [ ] Signup.jsx의 businessInfo 필드명이 AdminDashboard.jsx와 일치하는가?
2. [ ] googleSheetsService.js의 필드명도 동기화되었는가?
3. [ ] authService.js에서 개인회원은 approved: true, 사업자만 false인가?
4. [ ] Signup.jsx의 handleSubmit에 타임아웃과 finally가 있는가?
5. [ ] AdminDashboard.jsx의 테이블 colSpan이 컬럼 수와 일치하는가?
6. [ ] authService.js에 하드코딩 관리자 로그인이 없는가? (이메일/비밀번호 평문 X)
7. [ ] authService.js에서 `getIdTokenResult().claims.admin`으로만 admin 판별하는가?
8. [ ] ProtectedRoute.jsx에 `adminOnly` 체크가 있는가?
9. [ ] App.jsx `/admin` 라우트에 `adminOnly` prop이 있는가?
