-- Book Receipt 데이터베이스 스키마
-- Supabase SQL Editor에서 이 파일의 내용을 복사해서 실행하세요.

-- 1. books 테이블 생성 (도서 정보 저장)
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
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
  id BIGSERIAL PRIMARY KEY,
  format TEXT NOT NULL DEFAULT 'standard',
  printed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB DEFAULT '{}'::jsonb
);

-- 3. print_books 테이블 생성 (영수증과 도서의 관계)
CREATE TABLE IF NOT EXISTS print_books (
  id BIGSERIAL PRIMARY KEY,
  print_id BIGINT NOT NULL REFERENCES prints(id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(print_id, book_id)
);

-- 4. 인덱스 생성 (검색 속도 향상)
CREATE INDEX IF NOT EXISTS idx_prints_printed_at ON prints(printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_print_books_print_id ON print_books(print_id);
CREATE INDEX IF NOT EXISTS idx_print_books_book_id ON print_books(book_id);

-- 5. RLS (Row Level Security) 설정 - 공개 읽기/쓰기 허용
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_books ENABLE ROW LEVEL SECURITY;

-- 공개 정책: 모든 사용자가 읽기 가능
CREATE POLICY "Public read access" ON books FOR SELECT USING (true);
CREATE POLICY "Public read access" ON prints FOR SELECT USING (true);
CREATE POLICY "Public read access" ON print_books FOR SELECT USING (true);

-- 공개 정책: 모든 사용자가 쓰기 가능 (anon 키로 insert 가능)
CREATE POLICY "Public insert access" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON prints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON print_books FOR INSERT WITH CHECK (true);

-- =========================================================
-- Movie Receipt 스키마 (도서와 분리)
-- =========================================================

-- 6. movies 테이블 생성 (영화 메타데이터)
CREATE TABLE IF NOT EXISTS movies (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id BIGINT UNIQUE,
  title_ko TEXT NOT NULL,
  title_en TEXT,
  release_date DATE,
  age_rating TEXT,
  poster_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. movie_prints 테이블 생성 (영화 영수증 생성 기록)
CREATE TABLE IF NOT EXISTS movie_prints (
  id BIGSERIAL PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'receipt',
  format TEXT NOT NULL DEFAULT '60mm',
  printed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB DEFAULT '{}'::jsonb
);

-- 8. movie_print_movies 테이블 생성 (영화 영수증과 영화의 관계)
CREATE TABLE IF NOT EXISTS movie_print_movies (
  id BIGSERIAL PRIMARY KEY,
  movie_print_id BIGINT NOT NULL REFERENCES movie_prints(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(movie_print_id, movie_id)
);

-- 9. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_movie_prints_printed_at ON movie_prints(printed_at DESC);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movie_print_movies_print_id ON movie_print_movies(movie_print_id);
CREATE INDEX IF NOT EXISTS idx_movie_print_movies_movie_id ON movie_print_movies(movie_id);

-- 10. RLS (Row Level Security) 설정 - 공개 읽기/쓰기 허용
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_print_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON movie_prints FOR SELECT USING (true);
CREATE POLICY "Public read access" ON movie_print_movies FOR SELECT USING (true);

CREATE POLICY "Public insert access" ON movies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON movie_prints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON movie_print_movies FOR INSERT WITH CHECK (true);
