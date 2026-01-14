-- 스키마 마이그레이션 SQL
-- 기존 데이터를 백업한 후 실행하세요!
-- ⚠️ 주의: 이 스크립트는 기존 테이블을 삭제하고 새로 생성합니다.

-- 1. 기존 테이블 삭제 (외래키 제약조건 때문에 순서 중요)
DROP TABLE IF EXISTS print_books CASCADE;
DROP TABLE IF EXISTS prints CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- 2. books 테이블 생성 (id를 BIGSERIAL로 변경)
CREATE TABLE books (
  id BIGSERIAL PRIMARY KEY,
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT,
  publisher TEXT,
  cover_url TEXT,
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. prints 테이블 재생성 (id를 BIGSERIAL로 변경)
CREATE TABLE prints (
  id BIGSERIAL PRIMARY KEY,
  format TEXT NOT NULL DEFAULT 'standard',
  printed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB DEFAULT '{}'::jsonb
);

-- 4. print_books 테이블 생성 (영수증과 도서의 관계)
CREATE TABLE print_books (
  id BIGSERIAL PRIMARY KEY,
  print_id BIGINT NOT NULL REFERENCES prints(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(print_id, book_id)
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_prints_printed_at ON prints(printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_print_books_print_id ON print_books(print_id);
CREATE INDEX IF NOT EXISTS idx_print_books_book_id ON print_books(book_id);

-- 6. RLS (Row Level Security) 설정
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_books ENABLE ROW LEVEL SECURITY;

-- 공개 정책: 모든 사용자가 읽기 가능
CREATE POLICY IF NOT EXISTS "Public read access" ON books FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access" ON prints FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access" ON print_books FOR SELECT USING (true);

-- 공개 정책: 모든 사용자가 쓰기 가능
CREATE POLICY IF NOT EXISTS "Public insert access" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public insert access" ON prints FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Public insert access" ON print_books FOR INSERT WITH CHECK (true);

-- 6. 데이터 복원 (CSV에서 데이터를 가져온 경우)
-- 주의: CSV 데이터를 수동으로 INSERT하거나, 
-- 아래와 같이 기존 데이터를 변환할 수 있습니다.
-- 
-- 예시 (prints 테이블 데이터 복원):
-- INSERT INTO prints (format, printed_at, payload)
-- SELECT format, printed_at, payload FROM ... (기존 데이터 소스)
--
-- 예시 (print_books 테이블 데이터 복원):
-- INSERT INTO print_books (print_id, book_id, created_at)
-- SELECT print_id, book_id, created_at FROM ... (기존 데이터 소스)

