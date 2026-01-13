# 배포 가이드 (Vercel)

## 1. Vercel 계정 생성

1. https://vercel.com 접속
2. "Sign Up" 클릭
3. GitHub 계정으로 로그인 (권장)

---

## 2. 프로젝트 배포

### 방법 1: Vercel 웹 대시보드 사용 (추천)

1. Vercel 대시보드에서 **"Add New..." → "Project"** 클릭
2. GitHub 저장소 선택:
   - `book-receipt` 저장소 선택
   - 또는 "Import Git Repository"에서 저장소 URL 입력
3. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동)
   - **Output Directory**: `.next` (자동)
4. **Environment Variables** 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon 키
   - `NAVER_CLIENT_ID` = 네이버 API 클라이언트 ID
   - `NAVER_CLIENT_SECRET` = 네이버 API 클라이언트 시크릿
5. **"Deploy"** 클릭
6. 배포 완료까지 1-2분 대기

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서 실행
vercel

# 환경변수 설정 (대시보드에서 하는 게 더 쉬움)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NAVER_CLIENT_ID
vercel env add NAVER_CLIENT_SECRET
```

---

## 3. 배포 후 확인

### 3-1. 기본 URL 확인
- 배포 완료 후 **"Visit"** 버튼 클릭
- URL 형식: `https://book-receipt-xxxxx.vercel.app`
- 또는 프로젝트 설정에서 커스텀 도메인 설정 가능

### 3-2. 기능 테스트
1. 책 검색 기능 확인
2. 영수증 생성 및 JPEG 저장 확인
3. Supabase 기록 확인 (Table Editor에서)

---

## 4. 커스텀 도메인 설정 (선택사항)

### 4-1. 도메인 구매
- Namecheap, Cloudflare, Google Domains 등에서 구매

### 4-2. Vercel에 도메인 추가
1. 프로젝트 → **Settings** → **Domains**
2. 도메인 입력 (예: `bookreceipt.com`)
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. SSL 인증서 자동 발급 (몇 분 소요)

---

## 5. 자동 배포 설정

### 5-1. GitHub 연동 (이미 완료)
- GitHub에 푸시하면 자동으로 배포됨
- Pull Request마다 Preview 배포 생성

### 5-2. 환경변수 업데이트
- 프로젝트 → **Settings** → **Environment Variables**
- 환경변수 수정 후 재배포 필요 (자동 또는 수동)

---

## 6. 문제 해결

### 에러: "Build Failed"
- **원인**: 환경변수 누락 또는 빌드 오류
- **해결**: 
  - Vercel 대시보드에서 환경변수 확인
  - 로컬에서 `npm run build` 테스트

### 에러: "Function Runtime Error"
- **원인**: API Route 오류
- **해결**: 
  - Vercel 대시보드 → **Functions** 탭에서 로그 확인
  - 로컬에서 `/api/receipt` 테스트

### 에러: "Environment Variable Missing"
- **원인**: 환경변수 설정 누락
- **해결**: 
  - Settings → Environment Variables에서 모든 변수 확인
  - Production, Preview, Development 모두 설정

---

## 7. 무료 플랜 제한사항

- **Bandwidth**: 월 100GB
- **Function Execution**: 월 100GB-hours
- **Build Time**: 월 6000분
- **개인 프로젝트에는 충분함**

---

## 8. 추가 팁

### Preview 배포
- Pull Request마다 자동으로 Preview URL 생성
- 예: `book-receipt-git-feature-branch-username.vercel.app`
- 배포 전 테스트 가능

### Analytics (선택사항)
- Vercel Analytics 무료 플랜 사용 가능
- 프로젝트 → **Analytics** 탭에서 활성화

### Speed Insights
- 성능 모니터링 무료 제공
- 프로젝트 → **Speed Insights** 탭에서 활성화

