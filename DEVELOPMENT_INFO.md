# RSSOL-FE 개발 환경 및 스택 정보

## 프로젝트 개요
- **프로젝트명**: RSSOL-FE (알솔)
- **버전**: 0.0.0
- **타입**: ES Module
- **배포 플랫폼**: Vercel

---

## 개발 스택

### 핵심 프레임워크
- **React**: `^19.1.1` - UI 라이브러리
- **React DOM**: `^19.1.1` - React DOM 렌더링
- **React Router DOM**: `^7.9.3` - 클라이언트 사이드 라우팅

### 빌드 도구
- **Vite**: `^7.1.7` - 빌드 도구 및 개발 서버
- **@vitejs/plugin-react**: `^5.0.3` - React 플러그인
- **vite-plugin-svgr**: `^4.5.0` - SVG를 React 컴포넌트로 변환

### 스타일링
- **Tailwind CSS**: `^4.1.13` - 유틸리티 기반 CSS 프레임워크
- **@tailwindcss/vite**: `^4.1.13` - Tailwind CSS Vite 플러그인
- **PostCSS**: `^8.5.6` - CSS 후처리기
- **Autoprefixer**: `^10.4.21` - CSS 벤더 프리픽스 자동 추가
- **Pretendard 폰트** - 커스텀 폰트 (PretendardVariable.woff2)

### UI 라이브러리
- **Ant Design (antd)**: `^5.27.4` - UI 컴포넌트 라이브러리
- **Framer Motion**: `^12.23.24` - 애니메이션 라이브러리
- **Lucide React**: `^0.554.0` - 아이콘 라이브러리

### 캘린더 라이브러리
- **FullCalendar**: `^6.1.19` - 캘린더 컴포넌트
  - `@fullcalendar/core`
  - `@fullcalendar/daygrid`
  - `@fullcalendar/interaction`
  - `@fullcalendar/react`
  - `@fullcalendar/timegrid`
- **@toast-ui/react-calendar**: `^2.1.3` - Toast UI 캘린더
- **tui-calendar**: `^1.15.3` - Toast UI 캘린더 (레거시)

### HTTP 클라이언트
- **Axios**: `^1.13.2` - HTTP 요청 라이브러리

### 유틸리티
- **Day.js**: `^1.11.19` - 날짜/시간 처리 라이브러리

### 기타 의존성
- **@netlify/plugin-nextjs**: `^5.14.5` - Netlify 플러그인 (참고용)

---

## 개발 도구

### 코드 품질
- **ESLint**: `^9.36.0` - JavaScript/JSX 린터
  - `@eslint/js`: `^9.36.0`
  - `eslint-config-prettier`: `^10.1.8` - Prettier와 충돌 방지
  - `eslint-plugin-react`: `^7.37.5` - React 린팅 규칙
  - `eslint-plugin-react-hooks`: `^5.2.0` - React Hooks 규칙
  - `eslint-plugin-react-refresh`: `^0.4.20` - React Fast Refresh 규칙
  - `globals`: `^16.4.0` - 전역 변수 정의
- **Prettier**: `^3.6.2` - 코드 포맷터

### 타입 정의
- **@types/react**: `^19.1.13` - React 타입 정의
- **@types/react-dom**: `^19.1.9` - React DOM 타입 정의

### 빌드 최적화
- **Terser**: `^5.44.1` - JavaScript 압축 도구

---

## 개발 환경 설정

### Vite 설정 (`vite.config.js`)
- **빌드 최적화**:
  - Minify: Terser
  - Sourcemap: 비활성화 (프로덕션)
- **개발 서버**:
  - Host: `true` (모든 네트워크 인터페이스에서 접근 가능)
  - Strict Port: 활성화
  - HMR (Hot Module Replacement):
    - Host: `localhost`
    - Protocol: `ws` (WebSocket)
    - Port: `5173`
- **플러그인**:
  - React 플러그인
  - Tailwind CSS 플러그인
  - SVGR 플러그인 (SVG → React 컴포넌트)

### Tailwind CSS 설정 (`tailwind.config.js`)
- **컨텐츠 경로**: `./src/**/*.jsx`, `./index.html`
- **커스텀 폰트**: Pretendard
- **커스텀 애니메이션**:
  - `slide-up`: 슬라이드 업 애니메이션
  - `slide-down`: 슬라이드 다운 애니메이션

### ESLint 설정 (`eslint.config.js`)
- **파일 타입**: `**/*.{js,mjs,cjs,jsx}`
- **규칙**: 
  - Airbnb Base 스타일 가이드
  - Prettier 통합
  - React 권장 규칙
  - 브라우저 전역 변수

---

## NPM 스크립트

```json
{
  "dev": "vite",              // 개발 서버 실행
  "build": "vite build",      // 프로덕션 빌드
  "lint": "eslint .",         // 코드 린팅
  "preview": "vite preview"   // 빌드 결과 미리보기
}
```

---

## 배포 설정

### Vercel 설정 (`vercel.json`)
- **버전**: 2
- **리라이트 규칙**:
  - 모든 경로를 `/`로 리다이렉트 (SPA 라우팅)
  - `/api/*` 경로는 백엔드로 프록시

---

## 프로젝트 구조

```
RSSOL-FE/
├── public/              # 정적 파일
│   ├── fonts/          # 폰트 파일
│   └── logo-rssol.svg  # 로고
├── src/
│   ├── assets/         # 이미지, 아이콘, 로고 등
│   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── common/     # 공통 컴포넌트
│   │   └── layout/     # 레이아웃 컴포넌트
│   ├── context/         # React Context
│   ├── hooks/           # 커스텀 훅
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── auth/       # 인증 관련 페이지
│   │   ├── employee/   # 직원 관련 페이지
│   │   └── owner/      # 사장 관련 페이지
│   ├── services/        # API 서비스
│   ├── styles/          # 스타일 파일
│   └── utils/           # 유틸리티 함수
├── index.html           # HTML 엔트리 포인트
├── vite.config.js       # Vite 설정
├── tailwind.config.js   # Tailwind 설정
├── eslint.config.js     # ESLint 설정
└── package.json         # 프로젝트 의존성
```

---

## 주요 기능

### 인증
- 카카오 로그인
- 네이버 로그인
- 구글 로그인

### 사용자 역할
- **직원 (Employee)**: 직원 전용 페이지 및 기능
- **사장 (Owner)**: 사장 전용 페이지 및 기능

### 주요 기능 모듈
- 캘린더 관리 (FullCalendar, Toast UI)
- 알림 시스템
- 스케줄 관리
- 마이페이지

---

## 분석 도구

- **Google Analytics**: `G-5JD4C3XS8V` (gtag.js)

---

## 개발 환경 요구사항

- **Node.js**: 최신 LTS 버전 권장
- **npm**: Node.js와 함께 설치
- **브라우저**: 최신 버전의 Chrome, Firefox, Safari, Edge

---

## 시작하기

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **프로덕션 빌드**
   ```bash
   npm run build
   ```

4. **코드 린팅**
   ```bash
   npm run lint
   ```

---

## 참고사항

- 프로젝트는 ES Module 방식으로 구성되어 있습니다.
- React 19 버전을 사용하고 있습니다.
- Vite 7 버전을 사용하고 있습니다.
- Tailwind CSS 4 버전을 사용하고 있습니다.
- 개발 서버는 기본적으로 `localhost:5173`에서 실행됩니다.
