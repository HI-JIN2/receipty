# Book Receipt – 기획 초안

## 1. 서비스 개요
- 목적: 전자 도서 대여 시 영수증을 만들어 출력(일반 프린터/포토프린터/라벨기)할 수 있는 웹앱.
- 특성: 로그인 없음, 공용 집계만 저장. Next.js + Supabase + 외부 도서 API(Naver/Kakao/Google Books 등) 사용.

## 2. 핵심 가치 제안
- 빠른 영수증 생성: 검색 또는 수동 입력 후 즉시 프리뷰/인쇄.
- 재사용 가능한 템플릿: 일반(A4) + 소형(라벨/포토) 프린트 스타일.
- 집계 정보: 많이 뽑힌 책 TOP 랭킹, 총 생성 횟수 표시.

## 3. 주요 기능
1) 도서 검색
   - 외부 도서 API로 제목/저자/ISBN 검색.
   - 결과 선택 시 책 메타데이터 자동 채움(제목, 저자, 출판사, 표지, ISBN, 발행일).
   - 검색 실패 시 수동 입력 모드 제공.
2) 영수증 생성 & 프리뷰
   - 필수 필드: 제목, 저자, 출판사, 대여일, 만료일(선택), ISBN(선택), 표지(선택).
   - 출력 포맷 선택: `standard`(A4/일반) / `label`(좁은 폭) / `photo`.
   - 커스텀 메모/QR(선택) 영역.
3) 인쇄
   - 브라우저 인쇄(`window.print`)용 전용 print stylesheet.
   - 마진 최소화, 다크 모드 비적용, 폰트/바코드/QR(추가 옵션).
4) 집계/랭킹
   - TOP N 많이 뽑힌 책(prints count 기준).
   - 총 영수증 생성 횟수.
   - 최근 생성 리스트(선택).
5) 운영/관리(추가 고려)
   - DoS 방지: IP 당 생성 rate limit(클라이언트+서버/에지).
   - 캐시: 동일 책은 DB `books`에 upsert 후 재사용.

## 4. 사용자 플로우
1) 홈 진입 → 검색창에 제목/ISBN 입력 → 자동완성/검색 결과 노출.
2) 책 선택 → 영수증 입력폼 자동 채움 → 대여일/만료일/메모 등 수정.
3) 포맷 선택 → 실시간 프리뷰 → 인쇄 버튼.
4) 인쇄 트리거 시 `prints` insert → 집계 화면(`stats`)에 반영.

## 5. 화면 설계 (초안)
- `/` 홈: 검색창, 결과 리스트, 입력폼, 프리뷰, 포맷 토글, 인쇄 버튼.
- `/stats`: 인기 책 TOP N, 총 생성 횟수, (선택) 최근 생성 몇 건.
- 컴포넌트
  - `SearchBar`, `SearchResults`, `ReceiptForm`, `ReceiptPreview`, `FormatToggle`, `PrintButton`, `StatsList`.

## 6. 데이터 모델 (Supabase/Postgres)
- `books`
  - `id` uuid pk
  - `isbn` text unique null
  - `title` text, `author` text, `publisher` text, `cover_url` text, `published_at` date null
  - `created_at` timestamptz default now()
- `prints`
  - `id` uuid pk
  - `book_id` uuid references books(id) on delete restrict
  - `source` text (naver|kakao|google|manual)
  - `format` text (standard|label|photo)
  - `printed_at` timestamptz default now()
  - `payload` jsonb (대여일, 만료일, 메모 등)
- 집계 쿼리 예: `select b.*, count(*) cnt from prints p join books b on b.id=p.book_id group by b.id order by cnt desc limit N;`

## 7. 기술 스택
- 프론트: Next.js(App Router), TypeScript, Tailwind(or CSS Modules), React Query/Server Actions.
- 백엔드/DB: Supabase(Postgres + Auth 미사용), Edge Functions(Optional) for API proxy.
- 외부 API: 책 검색용(Naver/Kakao/Google Books 중 택1, CORS/키 정책 확인).

## 8. 인쇄/스타일 가이드
- print stylesheet에서 화면용 요소 숨김(검색, 버튼 등), 배경/테두리 유지.
- 폰트: 영수증용 mono/condensed 폰트 고려(예: `Roboto Mono`, `Inter`).
- 라벨 포맷: 고정 폭(예: 58mm/80mm) 미리보기, 여백 최소화.

## 9. 성능/보안
- Rate limit: IP 기반(클라이언트 단 검출 + 서버/에지에서 제한).
- 입력 검증: 제목/저자 필수, 길이 제한, XSS 방지(escape).
- Caching: 도서 검색 결과 로컬 캐시, `books` upsert로 DB 캐시.

## 10. 마일스톤 (제안)
1) 프로젝트 부트스트랩: Next.js + Supabase client 설정, 기본 라우트(`/`, `/stats`), UI 틀.
2) 도서 검색 연동(임시 mock → 실제 API), 검색/선택 → 폼 자동 채움.
3) 영수증 프리뷰/인쇄 스타일 완성(standard/label).
4) Supabase 연동: `books` upsert + `prints` insert, 집계 API/쿼리.
5) QA: 인쇄 품질, 모바일/데스크톱, 다크모드 비활성(print), 성능/레이트리밋.

