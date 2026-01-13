## Book Receipt
전자 도서 대여 영수증을 만들고 인쇄할 수 있는 웹앱. 로그인 없이 공용 집계(많이 뽑힌 책 랭킹, 총 생성 횟수)만 Supabase에 저장합니다. 스택: Next.js(App Router) + Supabase + Tailwind.

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
- 기본 추천: Vercel (환경변수 관리 및 Preview 용이).
- GitHub Pages: 정적 export 후 Pages에 업로드. 예시
  ```bash
  npm run build
  npx next export -o out   # 정적 빌드
  ```
  `out` 디렉토리를 GitHub Pages에 배포하고, `basePath`를 사용하는 경우 `next.config.ts`에 설정하십시오. Supabase 호출은 클라이언트에서 anon 키로 진행하므로 CORS 허용이 필요합니다.

### 네이버 도서 검색 프록시
- 경로: `src/app/api/search/route.ts`
- 사용: `/api/search?q=검색어` → 네이버 도서 API 호출 후 정제된 결과 반환.
- CORS 회피용 서버 프록시이며, 브라우저는 이 경로를 호출합니다.
