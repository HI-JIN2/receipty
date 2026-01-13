# Supabase 설정 가이드

## 1. Supabase 계정 생성 및 프로젝트 만들기

### 1-1. 계정 생성
1. https://supabase.com 접속
2. "Start your project" 또는 "Sign Up" 클릭
3. GitHub 계정으로 로그인 (또는 이메일로 가입)

### 1-2. 새 프로젝트 생성
1. 대시보드에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Name**: `book-receipt` (원하는 이름)
   - **Database Password**: 강한 비밀번호 입력 (잘 기억해두세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국에서 빠름)
3. "Create new project" 클릭
4. 프로젝트 생성 완료까지 1-2분 대기

---

## 2. API 키 확인하기

프로젝트가 생성되면:

1. 왼쪽 메뉴에서 **Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. 다음 정보를 복사해두세요:
   - **Project URL**: `https://xxxxx.supabase.co` 형태
   - **anon public** 키: `eyJhbGc...` 형태의 긴 문자열

---

## 3. 데이터베이스 테이블 생성하기

### 3-1. SQL Editor 열기
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭

### 3-2. 테이블 생성 SQL 실행
아래 SQL을 복사해서 붙여넣고 **Run** 버튼 클릭:

```sql
-- 1. books 테이블 생성 (도서 정보 저장)
CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  cover_url TEXT,
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. prints 테이블 생성 (영수증 생성 기록)
CREATE TABLE IF NOT EXISTS prints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  format TEXT NOT NULL DEFAULT 'standard',
  printed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB DEFAULT '{}'::jsonb
);

-- 3. 인덱스 생성 (검색 속도 향상)
CREATE INDEX IF NOT EXISTS idx_prints_book_id ON prints(book_id);
CREATE INDEX IF NOT EXISTS idx_prints_printed_at ON prints(printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- 4. RLS (Row Level Security) 설정 - 공개 읽기/쓰기 허용
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE prints ENABLE ROW LEVEL SECURITY;

-- 공개 정책: 모든 사용자가 읽기 가능
CREATE POLICY "Public read access" ON books FOR SELECT USING (true);
CREATE POLICY "Public read access" ON prints FOR SELECT USING (true);

-- 공개 정책: 모든 사용자가 쓰기 가능 (anon 키로 insert 가능)
CREATE POLICY "Public insert access" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON prints FOR INSERT WITH CHECK (true);
```

### 3-3. 테이블 확인
1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. `books`와 `prints` 테이블이 보이면 성공!

---

## 4. 환경변수 설정하기

### 4-1. 로컬 개발용 (.env.local)
프로젝트 루트에 `.env.local` 파일 생성 (또는 수정):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...긴키...
```

> ⚠️ `.env.local`은 `.gitignore`에 포함되어 있어야 합니다 (이미 설정되어 있음)

### 4-2. Vercel 배포 시 환경변수 설정
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 위 두 변수를 추가

---

## 5. 테스트하기

### 5-1. 개발 서버 실행
```bash
npm run dev
```

### 5-2. 브라우저에서 테스트
1. http://localhost:3000 접속
2. 책 검색 후 선택
3. 영수증 정보 입력
4. **"Supabase 기록"** 버튼 클릭
5. 성공 메시지 확인

### 5-3. Supabase에서 데이터 확인
1. Supabase 대시보드 → **Table Editor**
2. `books` 테이블: 저장된 도서 목록 확인
3. `prints` 테이블: 영수증 생성 기록 확인

---

## 6. 문제 해결

### 에러: "Missing Supabase env"
- `.env.local` 파일이 있는지 확인
- 환경변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
- 개발 서버 재시작 (`npm run dev`)

### 에러: "permission denied" 또는 "RLS policy"
- SQL Editor에서 RLS 정책이 제대로 생성되었는지 확인
- Table Editor에서 테이블이 보이는지 확인

### 에러: "relation does not exist"
- SQL Editor에서 테이블 생성 SQL을 다시 실행
- Table Editor에서 테이블이 생성되었는지 확인

---

## 7. 다음 단계

데이터가 잘 저장되면:
- `/stats` 페이지에서 랭킹/통계 표시
- Supabase 대시보드에서 직접 데이터 확인 가능

