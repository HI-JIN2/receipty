-- Book Receipt 데이터베이스 스키마
-- Supabase SQL Editor에서 이 파일의 내용을 복사해서 실행하세요.

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

