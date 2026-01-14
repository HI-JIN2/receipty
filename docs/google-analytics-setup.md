# Google Analytics 설정 가이드

## 1. Google Analytics 계정 생성

### 1-1. 계정 생성
1. https://analytics.google.com 접속
2. Google 계정으로 로그인
3. "측정 시작" 클릭

### 1-2. 속성(Property) 생성
1. **계정 이름**: `Book Receipt` (원하는 이름)
2. **속성 이름**: `Book Receipt Website` (원하는 이름)
3. **보고 시간대**: `대한민국`
4. **통화**: `대한민국 원(₩)`
5. "다음" 클릭

### 1-3. 비즈니스 정보 입력
1. **업종**: `기타` 또는 적절한 카테고리 선택
2. **비즈니스 규모**: `소규모` 선택
3. **Google Analytics 사용 목적**: 원하는 항목 선택
4. "만들기" 클릭

### 1-4. 데이터 스트림 설정
1. **플랫폼**: `웹` 선택
2. **웹사이트 URL**: 배포된 URL 입력 (예: `https://book-receipt.vercel.app`)
3. **스트림 이름**: `Book Receipt` (자동 입력됨)
4. "스트림 만들기" 클릭

---

## 2. 측정 ID 확인

1. 데이터 스트림 생성 후 **측정 ID** 확인
2. 형식: `G-XXXXXXXXXX` (예: `G-ABC123XYZ`)
3. 이 ID를 복사해두세요

---

## 3. 환경변수 설정

### 3-1. 로컬 개발용 (.env.local)
프로젝트 루트의 `.env.local` 파일에 추가:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3-2. Vercel 배포 시 환경변수 설정
1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. **Key**: `NEXT_PUBLIC_GA_ID`
3. **Value**: 측정 ID (예: `G-ABC123XYZ`)
4. **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭
6. 재배포 (자동 또는 수동)

---

## 4. 확인하기

### 4-1. 실시간 데이터 확인
1. Google Analytics 대시보드 → **보고서** → **실시간**
2. 웹사이트에 접속해보기
3. 몇 초 후 실시간 방문자 수 확인

### 4-2. 페이지뷰 확인
1. **보고서** → **참여도** → **페이지 및 화면**
2. 각 페이지의 조회수 확인

---

## 5. 추적 가능한 데이터

Google Analytics로 확인할 수 있는 정보:

- **방문자 수**: 일일/주간/월간 방문자
- **페이지뷰**: 각 페이지 조회 수
- **세션**: 사용자 세션 정보
- **이탈률**: 페이지 이탈률
- **사용자 디바이스**: 모바일/데스크톱 비율
- **지역**: 방문자 위치
- **트래픽 소스**: 어디서 유입되었는지

---

## 6. 고급 설정 (선택사항)

### 6-1. 이벤트 추적
특정 버튼 클릭이나 액션을 추적하려면:

```typescript
// 예: JPEG 저장 버튼 클릭 추적
gtag('event', 'download', {
  event_category: 'receipt',
  event_label: 'jpeg_export',
});
```

### 6-2. 전자상거래 추적
영수증 생성 수를 추적하려면:

```typescript
gtag('event', 'purchase', {
  transaction_id: 'receipt-123',
  value: 1,
  currency: 'KRW',
  items: [{
    item_name: 'Book Receipt',
    quantity: 1,
  }],
});
```

---

## 7. 문제 해결

### GA가 작동하지 않음
- 환경변수 `NEXT_PUBLIC_GA_ID`가 설정되었는지 확인
- 브라우저 개발자 도구 → Network 탭에서 `gtag/js` 요청 확인
- Google Analytics 실시간 보고서에서 확인 (몇 분 지연 가능)

### 측정 ID 형식 오류
- 측정 ID는 `G-`로 시작해야 함
- 공백이나 특수문자 없이 정확히 입력

### 배포 후 작동 안 함
- Vercel 환경변수 확인
- 재배포 필요할 수 있음

---

## 8. 개인정보 보호

### GDPR 준수
- Google Analytics는 쿠키를 사용합니다
- 필요시 쿠키 동의 배너 추가 고려

### IP 익명화 (선택사항)
더 엄격한 개인정보 보호를 원하면:

```typescript
gtag('config', 'GA_ID', {
  anonymize_ip: true,
});
```

---

## 9. 대안: Vercel Analytics

Vercel을 사용하는 경우 **Vercel Analytics**도 무료로 제공됩니다:

1. Vercel 대시보드 → 프로젝트 → **Analytics** 탭
2. "Enable Analytics" 클릭
3. 별도 설정 없이 자동으로 트래픽 추적

**장점:**
- 설정 불필요
- Vercel 대시보드에서 바로 확인
- 개인정보 보호 친화적

**단점:**
- Google Analytics보다 기능 제한적
- 상세한 분석 기능 부족


