# Open Graph 이미지 생성 가이드

사이트 미리보기(소셜 미디어 공유 시 표시되는 이미지)를 설정하는 방법입니다.

## 이미지 요구사항

- **파일명**: `og-image.png`
- **위치**: `/public/og-image.png`
- **크기**: 1200px × 630px (권장)
- **형식**: PNG 또는 JPG

## 생성 방법

### 방법 1: 디자인 도구 사용 (Figma, Canva 등)

1. **Figma 사용**:
   - 새 파일 생성
   - 프레임 크기: 1200 × 630px
   - 영수증 미리보기 디자인
   - PNG로 내보내기 → `public/og-image.png`로 저장

2. **Canva 사용**:
   - 템플릿 크기: 1200 × 630px 선택
   - "Instagram Post" 또는 "Facebook Post" 템플릿 사용
   - 디자인 후 PNG로 다운로드
   - `public/og-image.png`로 저장

### 방법 2: 온라인 OG 이미지 생성기 사용

- https://www.opengraph.xyz/
- https://og-image.vercel.app/
- 제목과 설명 입력 후 이미지 생성

### 방법 3: 코드로 동적 생성 (고급)

Next.js의 `opengraph-image` 기능 사용:
- `src/app/opengraph-image.tsx` 파일 생성
- React 컴포넌트로 이미지 생성

## 이미지 디자인 팁

- **제목**: "Book Receipt - 나만의 도서 영수증 만들기"
- **간단한 설명**: "도서 영수증을 쉽게 만들고 프린트하세요"
- **브랜드 색상**: 앰버/베이지 톤 사용
- **가독성**: 텍스트가 작아도 읽을 수 있도록

## 파일 배치

생성한 이미지를 다음 위치에 저장:
```
/public/og-image.png
```

## 확인 방법

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 확인:
   - Facebook 공유 디버거: https://developers.facebook.com/tools/debug/
   - Twitter 카드 검증: https://cards-dev.twitter.com/validator
   - LinkedIn 포스트 검사기: https://www.linkedin.com/post-inspector/

## 현재 설정

`src/app/layout.tsx`에서 다음 경로를 참조합니다:
```typescript
images: [
  {
    url: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "Book Receipt",
  },
]
```

