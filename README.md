## Book Receipt
<img width="1200" height="630" alt="og-image" src="https://github.com/user-attachments/assets/c4133625-953e-441f-9be5-ffe43cdbda23" />
<img width="1200" height="630" alt="Frame 1" src="https://github.com/user-attachments/assets/8b48d3bb-e3f7-4526-8816-e83067335e5b" />

- 도서 대여 영수증을 만드는 웹사이트.   
- 로그인 없이 공용 집계(많이 뽑힌 책 랭킹, 총 생성 횟수)만 Supabase에 저장합니다. 
- 스택: Next.js(App Router) + Supabase + Tailwind.

### 빠른 시작
```bash
npm install
cp env.example .env.local   # 또는 환경변수 수동 설정
npm run dev
```
로컬: http://localhost:3000

### 환경변수
Supabase 프로젝트 생성 후 URL/anon 키를 발급해 아래를 채웁니다.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` (네이버 도서 검색용, `/api/search` 프록시에서 사용)
- `NEXT_PUBLIC_GA_ID` (선택사항, Google Analytics 측정 ID)

### Supabase 설정 (처음 사용하시나요?)
📖 **자세한 가이드**: [`docs/supabase-setup.md`](./docs/supabase-setup.md) 참고

**빠른 요약:**
1. https://supabase.com 에서 계정 생성 및 프로젝트 생성
2. Settings → API에서 URL과 anon 키 복사
3. SQL Editor에서 [`supabase/schema.sql`](./supabase/schema.sql) 실행
4. `.env.local`에 환경변수 설정
5. `npm run dev` 재시작

### 개발 메모
- 데이터 모델: `books`(메타데이터 캐시) + `prints`(영수증 생성 로그) 분리.
- 기본 페이지: `/` 랜딩, `/stats`(집계) 예정.
- 인쇄: print stylesheet로 라벨/포토/일반 포맷 지원 예정.

### 배포
📖 **자세한 가이드**: [`docs/deployment.md`](./docs/deployment.md) 참고

**Vercel 배포 (추천):**
- 무료 플랜 제공
- URL: `프로젝트명.vercel.app` (예: `book-receipt.vercel.app`)
- Next.js 최적화 (API Routes, 서버 기능 지원)
- GitHub 연동으로 자동 배포
- 환경변수 관리 쉬움

**빠른 배포:**
1. https://vercel.com 에서 GitHub 계정으로 로그인
2. "Add New Project" → 저장소 선택
3. 환경변수 설정 (Supabase, 네이버 API 키)
4. "Deploy" 클릭
5. 완료! 🎉

> **참고**: GitHub Pages는 API Routes를 사용할 수 없어 이 프로젝트에는 부적합합니다.

### Google Analytics 설정 (선택사항)
📖 **자세한 가이드**: [`docs/google-analytics-setup.md`](./docs/google-analytics-setup.md) 참고

**빠른 설정:**
1. https://analytics.google.com 에서 계정 생성
2. 속성 생성 후 측정 ID 발급 (형식: `G-XXXXXXXXXX`)
3. `.env.local`에 `NEXT_PUBLIC_GA_ID` 추가
4. Vercel 배포 시 환경변수에도 추가

> **대안**: Vercel Analytics도 무료로 제공됩니다 (Vercel 대시보드에서 활성화)

### 네이버 도서 검색 프록시
- 경로: `src/app/api/search/route.ts`
- 사용: `/api/search?q=검색어` → 네이버 도서 API 호출 후 정제된 결과 반환.
- CORS 회피용 서버 프록시이며, 브라우저는 이 경로를 호출합니다.
