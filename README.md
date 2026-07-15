# kalmia — Homepage

커다란 희망을 디자인합니다. kalmia 디자인 포트폴리오의 히어로 랜딩 페이지입니다.

## 구성

```
.
├── index.html            # 마크업
├── css/
│   └── style.css         # 전체 스타일 (헤더·메뉴·브랜드 카피·커스텀 커서)
├── js/
│   └── main.js           # 커스텀 커서 / 햄버거 메뉴 / 배경 영상
└── assets/
    ├── logo.png          # 심볼 로고
    ├── hero.mp4          # 배경 영상
    └── fonts/            # Aclonica, Poppins (사용 웨이트 + 라이선스)
```

## 주요 기능

- **배경 영상 히어로** — `js/main.js`의 `VIDEOS` 배열에 경로를 추가하면 순서대로 순환 재생됩니다.
- **햄버거 메뉴** — 우측 상단 원형 버튼 → 흰색 레이어 페이드인, Experience / About / Contact 노출 (ESC·항목 클릭 시 닫힘).
- **반응형 브랜드 카피** — 화면이 좁아지면(≤900px) `kalmia` 아래로 태그라인이 한 줄로 내려가고, `kalmia`가 좌우 마진을 뺀 폭을 꽉 채웁니다.
- **커스텀 커서** — 리퀴드 글래스 물방울 + 물길 트레일 (마우스 기기 한정, `prefers-reduced-motion` 존중).

## 로컬 실행

정적 파일이라 별도 빌드가 없습니다. 로컬 서버로 열면 됩니다.

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## 폰트 라이선스

- Aclonica — `assets/fonts/Aclonica-LICENSE.txt`
- Poppins — `assets/fonts/Poppins-OFL.txt` (SIL Open Font License)
