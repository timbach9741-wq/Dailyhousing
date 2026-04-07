---
description: 장바구니 계산, 주문 저장, 회원가입 핵심 로직 보호 규칙 - 코드 변경 시 반드시 이 워크플로우를 먼저 읽고 확인할 것 (2026-03-23 확정)
---

# 🔒🔒🔒 장바구니 · 주문 · 회원가입 핵심 로직 보호 금고

> [!CAUTION]
> **⛔ 아래 파일들은 2026-03-23 심각한 버그 수정 후 확정된 핵심 비즈니스 로직입니다.**
> **이 파일들을 임의로 수정하면 결제 금액 오류, 수량 2배 버그, 회원가입 실패 등 치명적 장애가 발생합니다.**
> **사용자의 명시적 요청 없이는 절대 수정하지 마십시오.**

---

## ⛔ 1등급 보호 — 절대 변경 금지 파일

### `src/store/useCartStore.js` 🔒 영구 잠금

| 함수 | 핵심 로직 | 절대 변경 금지 사항 |
|------|----------|-------------------|
| `getEffectivePrice()` | 사업자/일반 가격 분기 | `isBusiness && product.businessPrice` 조건 |
| `addToCart()` | 기존 수량에 **누적 합산** | `qty + qty` 합산 로직 (의도적 설계) |
| `setCartItem()` | 기존 수량을 **교체(덮어쓰기)** | `qty: qty` 교체 로직 (바로구매용) |
| `updateQuantity()` | 장바구니 내 수량 변경 | `newQty` 직접 대입 |

> [!WARNING]
> **2026-03-23 버그 원인**: `addToCart`(누적)과 `setCartItem`(교체)이 혼용되어 수량이 2배가 됨.
> - **상세 페이지의 "장바구니"/"바로구매" 버튼**은 반드시 `setCartItem`을 사용
> - `addToCart`는 장바구니 페이지 내 수량 조절에만 사용

### `src/store/useOrderStore.js` 🔒 영구 잠금

| 함수 | 핵심 로직 | 절대 변경 금지 사항 |
|------|----------|-------------------|
| `addOrder()` | 주문 저장 (Firestore) | `isBusiness` 파라미터 5번째 인자 |
| 아이템 가격 계산 | `effectivePrice = (isBusiness && businessPrice) ? businessPrice : price` | 사업자가 적용 로직 |
| `totalPrice` 계산 | `effectivePrice * item.qty` | 유효 가격 × 수량 |

> [!WARNING]
> **2026-03-23 버그 원인**: 주문 저장 시 항상 `price`(일반가)만 사용하여 사업자가가 미적용됨.
> - `addOrder` 호출 시 반드시 5번째 인자로 `isBusiness`를 전달할 것
> - `ShoppingCartCheckout.jsx`의 `handleCheckout`에서 `addOrder(items, finalPrice, uid, checkoutUser, isBusiness)` 형태 유지

### `src/pages/ShoppingCartCheckout.jsx` 🔒 영구 잠금

| 영역 | 핵심 로직 | 절대 변경 금지 사항 |
|------|----------|-------------------|
| L93 `totalPrice` | `getEffectivePrice(item.product, isBusiness) * item.qty` | 가격 계산 공식 |
| L97 `tax` | `Math.floor(totalPrice * 0.1)` | 부가세 10% |
| L98 `finalPrice` | `totalPrice + tax` | 최종 금액 |
| `handleCheckout` | `addOrder(items, finalPrice, uid, checkoutUser, isBusiness)` | 5번째 인자 `isBusiness` |
| 배송 표시 | `isTileOrBox ? '박스배송' : '롤배송'` | 프레스티지 = 박스배송 |
| L494~544 배송비 안내 | 전체 착불 표시 | 모든 회원 착불 (2026-04-01 변경) |

> [!WARNING]
> **결제 요약 영역 금액 보호**: `totalPrice`, `tax`, `finalPrice` 계산 공식을 절대 변경하지 말 것.
> 배송비 영역(`!isBusiness` 분기)과 `checkFreeDeliveryEligibility` 함수도 보호 대상.

### `src/pages/FlooringProductDetailView.jsx` 🔒 부분 잠금 (장바구니 버튼 영역)

| 영역 | 핵심 로직 | 절대 변경 금지 사항 |
|------|----------|-------------------|
| L231 | `useCartStore((state) => state.setCartItem)` | `addToCart` 아닌 `setCartItem` 사용 |
| L580 (장바구니 버튼) | `setCartItem(product, cartQty)` | **절대로 `addToCart`로 바꾸지 말 것** |
| L593 (바로구매 버튼) | `setCartItem(product, cartQty)` | **절대로 `addToCart`로 바꾸지 말 것** |
| L459 `effectivePrice` | 사업자→businessPrice, 일반→price | 가격 분기 로직 유지 |
| L470~472 `totalPrice` | `effectivePrice * qty` (롤: `× totalMetersOrArea`) | 합계 금액 공식 |
| L170~223 `getProductUnit()` | 프레스티지 → `Box` + `sheetsPerBox` 파싱 | 프레스티지 박스 단위 유지 |

> [!CAUTION]
> **2026-03-26 사고 기록**: 장바구니 버튼을 `setCartItem` → `addToCart`로 잘못 변경하여 금액 오류 발생.
> **교훈**: 이 보호 문서를 먼저 확인하지 않고 코드를 수정하면 안 됨.

---

## ⛔ 2등급 보호 — 회원가입/인증 (기존 signup-admin-protection 참조)

| 파일 | 보호 상태 |
|------|---------|
| `src/services/authService.js` | 🔒 영구 잠금 (signup/login 함수) |
| `src/pages/Signup.jsx` | 🔒 영구 잠금 (businessInfo 필드명) |
| `src/pages/AdminDashboard.jsx` | 🔒 영구 잠금 (회원 관리 테이블) |
| `src/services/googleSheetsService.js` | 🔒 영구 잠금 (웹훅 호출) |
| `src/services/businessVerifyService.js` | 🔒 영구 잠금 (국세청 API) |

---

## 🛡️ 작업 전 필수 체크리스트

**모든 작업 시작 전에 아래 항목을 반드시 확인하세요:**

### Step 1: 보호 파일 확인
- [ ] 수정하려는 파일이 이 문서의 보호 대상인지 확인했는가?
- [ ] 보호 대상이면 사용자에게 "🔒 이 파일은 보호 대상입니다. 정말 수정하시겠습니까?" 로 확인을 받았는가?

### Step 2: 장바구니/주문 계산 체크
- [ ] `setCartItem`이 `addToCart`로 바뀌지 않았는가?
- [ ] `getEffectivePrice`의 사업자가 분기가 유지되는가?
- [ ] `addOrder` 호출 시 `isBusiness` 인자가 전달되는가?
- [ ] 프레스티지 제품이 "박스배송"으로 표시되는가? (롤배송 아님!)

### Step 3: 회원가입 체크
- [ ] 개인회원 `approved: true`, 사업자 `approved: false` 분기가 유지되는가?
- [ ] businessInfo 필드명이 Signup ↔ AdminDashboard ↔ GoogleSheets 3곳에서 일치하는가?

### Step 4: 수정 후 검증
- [ ] `npm run build` 성공 확인
- [ ] 프레스티지 1Box 담기 → 장바구니에서 1Box 유지 확인
- [ ] 사업자 회원가입 → 관리자 승인 대기 → 구글 시트 기록 확인

---

## 🔑 확정된 가격 데이터 (2026-03-23 기준)

### 프레스티지 (Box당 가격)

| 항목 | 타일(PTT) | 우드(PTW) |
|------|----------|----------|
| 일반가(price) | 48,000원/Box | 48,000원/Box |
| 사업자가(businessPrice) | 43,000원/Box | 43,000원/Box |
| 매입가(sellingPrice) | 38,000원/Box | 38,000원/Box |
| 포장 | 1박스 5매 | 1박스 6매 |

---

## 📅 변경 이력

| 날짜 | 변경 내용 | 파일 |
|------|----------|------|
| 2026-03-23 | `setCartItem` 함수 추가 (수량 교체) | `useCartStore.js` |
| 2026-03-23 | 장바구니/바로구매 버튼 `addToCart` → `setCartItem` 교체 | `FlooringProductDetailView.jsx` |
| 2026-03-23 | 프레스티지 "롤배송" → "박스배송" 표시 수정 | `ShoppingCartCheckout.jsx` |
| 2026-03-23 | 주문 저장 시 사업자가 적용 로직 추가 | `useOrderStore.js` |
| 2026-03-23 | 프레스티지 sheetsPerBox 파싱 추가 | `FlooringProductDetailView.jsx` |
| 2026-03-24 | `formatOrderUnit` 정규식 이중 이스케이프 버그 수정 + M→롤 변환 로직 추가 | `adminService.js` |
| 2026-03-24 | 발주서 시트→롤(R), 나머지→박스(Box) 자동 단위 설정 | `PurchaseOrderForm.jsx` |
| 2026-03-24 | 장바구니 수량 표시에 `packaging` 전달하여 롤 변환 활성화 | `ShoppingCartCheckout.jsx` |
| 2026-03-24 | 장바구니 +/- 버튼 시트 제품 롤 길이 단위로 증감 | `ShoppingCartCheckout.jsx` |
| 2026-03-24 | 장바구니 아이콘 배지를 제품 종류 수(`items.length`)로 변경 | `Header.jsx` |
| 2026-03-24 | 주문 저장 시 `model_id`, `packaging` 필드 포함 | `useOrderStore.js` |
| 2026-03-24 | 기존 주문 발주서에서 제품 스토어 조회로 `packaging` 자동 보완 | `PurchaseOrderForm.jsx` |
| 2026-03-26 | 사업자 무료배송 자격 판별 `checkFreeDeliveryEligibility()` 추가 | `ShoppingCartCheckout.jsx` |
| 2026-03-26 | 결제 요약 배송비 영역에 사업자/일반 분기 표시 추가 | `ShoppingCartCheckout.jsx` |
| 2026-03-26 | ⚠️ 장바구니 버튼 `setCartItem`→`addToCart` 잘못 변경 후 즉시 롤백 | `FlooringProductDetailView.jsx` |
| 2026-04-01 | 사업자 무료배송 기능 전체 삭제 - 모든 배송 착불로 통일 | `ShoppingCartCheckout.jsx`, `AdminDashboard.jsx` |

