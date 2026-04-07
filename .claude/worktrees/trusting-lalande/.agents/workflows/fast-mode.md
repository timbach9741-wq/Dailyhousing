---
description: 빠른 작업 모드 - 불필요한 검증 단계를 줄이고 코드 변경을 즉시 수행
---

# ⚡ Fast Mode - 빠른 작업 최적화 규칙

## 핵심 원칙

**코드 수정은 즉시, 검증은 최소한으로, 브라우저 서브에이전트는 꼭 필요할 때만.**

---

## 🚫 하지 말 것 (시간 낭비)

1. **브라우저 서브에이전트 남용 금지**
   - 단순 코드 수정 후 매번 브라우저로 확인하지 않는다
   - 서브에이전트가 코드를 수정하려는 시도 차단 (view_file/replace는 메인에서만)
   - 스크린샷 한 장이면 될 것을 여러 번 찍지 않는다

2. **파일 반복 읽기 금지**
   - 같은 파일을 이미 읽었으면 다시 읽지 않는다
   - grep으로 충분하면 view_file 하지 않는다

3. **과도한 설명 금지**
   - 변경 전/후 비교표 매번 만들지 않는다
   - 바로 수정하고 결과만 짧게 보고

---

## ✅ 해야 할 것 (효율적 작업)

### 1. 코드 수정: 즉시 실행

유저 요청 → 바로 코드 수정 → 완료 보고 (1-2줄)

- 파일 위치를 이미 안다면 grep/view 없이 바로 수정
- 병렬 수정 가능하면 동시에 여러 파일 수정

### 2. 브라우저 확인: 유저 요청 시에만

유저가 "확인해" "보여줘"라고 할 때만 브라우저 사용

- 코드 수정 후 자동 확인 불필요 (HMR이 알아서 반영)
- 유저가 직접 브라우저에서 확인 가능

### 3. 서브에이전트 사용 시: 최소 지시

- URL 열기 + 스크린샷 1장 = 끝
- DOM 분석, JS 실행 등 복잡한 작업은 메인에서 처리
- 서브에이전트에게 코드 수정 권한 절대 안 줌

### 4. 공식 사이트 데이터 수집: 한 번에 완벽히

read_url_content로 HTML 소스 가져오기 → 파싱 → 적용. 브라우저는 read_url_content 불가 시에만 사용

---

## 📋 작업 유형별 최적 경로

### A. 이미지 URL 변경

1. grep으로 현재 URL 확인 (또는 이미 알고 있으면 스킵)
2. replace_file_content로 즉시 변경
3. 완료 보고

### B. 레이아웃/CSS 변경

1. view_file로 해당 렌더링 코드 확인 (필요시)
2. replace_file_content로 즉시 변경
3. 완료 보고

### C. 제품 데이터 등록/수정

1. read_url_content로 공식 사이트 HTML 가져오기
2. 데이터 파싱 (메인에서 직접)
3. write_to_file 또는 replace로 적용
4. 완료 보고

### D. 하단 이미지(Feature) 수정

1. read_url_content로 공식 사이트 상세 페이지 HTML 가져오기
2. img 태그에서 URL 추출
3. SheetFeature.jsx (또는 해당 Feature 파일) 직접 수정
4. 완료 보고

---

## 🔧 자주 사용하는 파일 경로

| 용도 | 경로 |
| ---- | ---- |
| 제품 데이터 | `src/data/lxzin-products.js` |
| 시트 하단 이미지 | `src/components/product/SheetFeature.jsx` |
| 에디톤 마루/스톤 하단 | `src/components/product/EditonFeature.jsx` / `EditonStoneFeature.jsx` |
| 타일 하단 | `src/components/product/TileFeature.jsx` |
| 보호 문서 | `.agents/workflows/editon-protection.md` |
| 제품 이미지 폴더 | `public/assets/products/` |

---

## ⚡ 응답 형식 (간결하게)

수정 완료 시:

- ✅ `파일명` 수정 완료 - 변경 내용 1줄 요약

여러 파일 수정 시:

- ✅ `파일1`: 변경내용
- ✅ `파일2`: 변경내용
