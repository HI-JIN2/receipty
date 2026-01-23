import SiteChrome from "@/components/SiteChrome";

export default function CreditsPage() {
  return (
    <SiteChrome activeHref="/credits">
      <header className="ui-page-header">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ui-muted)]">
          <span className="h-[1px] w-6 bg-black/20" />
          Credits
          <span className="h-[1px] w-6 bg-black/20" />
        </p>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
          라이선스
        </h1>
        <p className="max-w-3xl text-base text-[var(--ui-muted)] sm:text-lg">
          이 페이지는 본 서비스에서 사용한 폰트/데이터 소스/표기 의무(라이선스)를 정리합니다.
        </p>
      </header>

      <section className="ui-section">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Fonts</h2>
        <div className="mt-4 space-y-4 text-sm text-[var(--ui-muted)]">
          <div className="rounded-2xl bg-black/5 p-4">
            <div className="font-semibold text-[var(--foreground)]">Galmuri</div>
            <div className="mt-1">용도: 영화 영수증(레시트)용 폰트</div>
            <div className="mt-1">소스: npm `galmuri` 패키지</div>
            <div className="mt-1">라이선스: SIL Open Font License 1.1</div>
          </div>

          <div className="rounded-2xl bg-black/5 p-4">
            <div className="font-semibold text-[var(--foreground)]">IBM Plex Sans KR</div>
            <div className="mt-1">용도: UI 기본 폰트</div>
            <div className="mt-1">소스: Google Fonts (next/font/google)</div>
            <div className="mt-1">라이선스: SIL Open Font License 1.1</div>
          </div>

          <div className="rounded-2xl bg-black/5 p-4">
            <div className="font-semibold text-[var(--foreground)]">PFStardust (Local)</div>
            <div className="mt-1">용도: 도서 영수증 프리뷰, 영화 영수증(비트맵) 스타일</div>
            <div className="mt-1">파일: `src/app/fonts/PFStardust-*.ttf`, `src/app/fonts/PFStardust-S-*.ttf`</div>
            <div className="mt-1">
              라이선스/표기: 이 레포에 별도 LICENSE 파일이 없으니, 폰트 원 출처의 라이선스를 확인해서
              여기에 명시해주세요.
            </div>
          </div>

          <div className="rounded-2xl bg-black/5 p-4">
            <div className="font-semibold text-[var(--foreground)]">Jalnan / Jalnan Gothic (Local)</div>
            <div className="mt-1">파일: `src/app/fonts/Jalnan2TTF.ttf`, `src/app/fonts/JalnanGothicTTF.ttf`</div>
            <div className="mt-1">
              현재 코드에서 사용하지 않더라도 저장소에 포함되어 배포되면 라이선스 영향이 있을 수 있어요.
              폰트 원 출처/라이선스를 확인해서 필요 시 표기해주세요.
            </div>
          </div>
        </div>
      </section>

      <section className="ui-section-compact sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Data & APIs</h2>
        <div className="mt-4 space-y-4 text-sm text-[var(--ui-muted)]">
          <div className="rounded-2xl bg-black/5 p-4">
            <div className="font-semibold text-[var(--foreground)]">TMDB</div>
            <div className="mt-1">용도: 영화 검색/한글·영문 제목/관람등급 자동 채우기</div>
            <div className="mt-1">
              표기: “This product uses the TMDB API but is not endorsed or certified by TMDB.”
            </div>
          </div>

          <div className="rounded-2xl bg-black/5 p-4">
            <div className="font-semibold text-[var(--foreground)]">Naver Search API</div>
            <div className="mt-1">용도: 도서 검색</div>
            <div className="mt-1">
              표기/약관: 네이버 Open API 가이드의 표기 요구 사항을 확인해서 필요 시 반영해주세요.
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
