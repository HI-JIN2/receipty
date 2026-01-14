# Supabase 데이터베이스 백업 가이드

## 방법 1: Supabase 대시보드에서 직접 내보내기 (가장 간단)

### 1-1. Table Editor에서 CSV 내보내기
1. Supabase 대시보드 → **Table Editor** 클릭
2. 백업할 테이블 선택 (`books`, `prints`, `print_books`)
3. 우측 상단 **"..."** 메뉴 → **"Export as CSV"** 클릭
4. CSV 파일 다운로드

### 1-2. SQL Editor에서 데이터 내보내기
1. Supabase 대시보드 → **SQL Editor** 클릭
2. 다음 SQL 실행하여 데이터 확인:

```sql
-- books 테이블 데이터 확인
SELECT * FROM books;

-- prints 테이블 데이터 확인
SELECT * FROM prints;

-- print_books 테이블 데이터 확인
SELECT * FROM print_books;
```

3. 결과를 복사하여 텍스트 파일로 저장

---

## 방법 2: SQL로 전체 데이터 백업

### 2-1. SQL Editor에서 실행

```sql
-- books 테이블 백업 (INSERT 문 생성)
SELECT 
  'INSERT INTO books (id, isbn, title, author, publisher, cover_url, published_at, created_at) VALUES (' ||
  '''' || id || ''', ' ||
  COALESCE('''' || isbn || '''', 'NULL') || ', ' ||
  '''' || REPLACE(title, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(author, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || REPLACE(publisher, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || cover_url || '''', 'NULL') || ', ' ||
  COALESCE('''' || published_at || '''', 'NULL') || ', ' ||
  '''' || created_at || ''');'
FROM books;

-- prints 테이블 백업
SELECT 
  'INSERT INTO prints (id, format, printed_at, payload) VALUES (' ||
  id || ', ' ||
  '''' || format || ''', ' ||
  '''' || printed_at || ''', ' ||
  '''' || payload::text || ''');'
FROM prints;

-- print_books 테이블 백업
SELECT 
  'INSERT INTO print_books (id, print_id, book_id, created_at) VALUES (' ||
  id || ', ' ||
  print_id || ', ' ||
  '''' || book_id || ''', ' ||
  '''' || created_at || ''');'
FROM print_books;
```

### 2-2. 결과 저장
- 각 쿼리 결과를 복사하여 `.sql` 파일로 저장

---

## 방법 3: pg_dump 사용 (고급)

### 3-1. 연결 정보 확인
1. Supabase 대시보드 → **Settings** → **Database**
2. **Connection string** 확인 (URI 형식)

### 3-2. 로컬에서 백업
```bash
# 전체 데이터베이스 백업
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup.sql

# 특정 테이블만 백업
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -t books -t prints -t print_books > backup.sql
```

> ⚠️ **주의**: Database Password는 Settings → Database에서 확인하거나 재설정할 수 있습니다.

---

## 방법 4: Supabase CLI 사용 (선택사항)

### 4-1. Supabase CLI 설치
```bash
npm install -g supabase
```

### 4-2. 로그인 및 프로젝트 연결
```bash
supabase login
supabase link --project-ref [PROJECT_REF]
```

### 4-3. 데이터베이스 덤프
```bash
supabase db dump -f backup.sql
```

---

## 추천 방법

**간단한 백업**: 방법 1 (Table Editor에서 CSV 내보내기)
- 빠르고 간단
- 테이블별로 개별 백업 가능

**완전한 백업**: 방법 2 (SQL INSERT 문 생성)
- 데이터와 구조 모두 포함
- 복원이 쉬움

**전문가용**: 방법 3 (pg_dump)
- 가장 완전한 백업
- PostgreSQL 표준 도구 사용

---

## 복원 방법

### CSV로 복원 (Supabase Table Editor 사용)
1. Supabase 대시보드 → **Table Editor** 클릭
2. 복원할 테이블 선택
3. **"Insert row"** 클릭하여 수동 입력
4. 또는 **"Insert"** → **"Import data from CSV"** 사용

### SQL로 복원 (SQL Editor 사용)
1. SQL Editor 열기
2. CSV 데이터를 INSERT 문으로 변환하여 실행

```sql
-- 예시: books 테이블 복원
INSERT INTO books (id, isbn, title, author, publisher, cover_url, published_at, created_at)
VALUES 
  ('uuid-1', '978-xxx', '책 제목', '저자', '출판사', 'url', '2024-01-01', '2024-01-01 00:00:00'),
  ('uuid-2', '978-yyy', '책 제목2', '저자2', '출판사2', 'url2', '2024-01-02', '2024-01-02 00:00:00');
```

> 💡 **팁**: CSV를 SQL INSERT 문으로 변환하는 온라인 도구를 사용할 수도 있습니다.

### SQL로 복원
1. SQL Editor 열기
2. 백업한 `.sql` 파일 내용 붙여넣기
3. **Run** 클릭

---

## 주의사항

⚠️ **스키마 변경 전에는 반드시 백업하세요!**
- 기존 데이터가 삭제될 수 있습니다
- 특히 `DROP TABLE` 명령 실행 전에 백업 필수

⚠️ **정기적인 백업 권장**
- 중요한 데이터는 주기적으로 백업하세요
- Supabase 무료 플랜은 자동 백업을 제공하지만, 수동 백업도 권장합니다

