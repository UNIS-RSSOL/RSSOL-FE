# 🚨 배포 오류 해결 가이드

## 문제 상황
프로덕션 빌드에 Vite 개발 서버 코드가 포함되어 `localhost:5173`을 참조하는 오류가 발생했습니다.

## 해결 방법

### 1️⃣ 환경변수 파일 생성

프로젝트 루트에 다음 파일들을 생성하세요:

#### `.env.development` (로컬 개발용)
```env
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000
```

#### `.env.production` (배포용)
```env
VITE_API_URL=https://your-backend-api-url.com
VITE_API_BASE_URL=https://your-backend-api-url.com
```

> ⚠️ **중요**: `.env.production`의 `your-backend-api-url.com`을 실제 백엔드 API 주소로 변경하세요!

### 2️⃣ 프로덕션 빌드 재생성

```bash
# 기존 빌드 삭제
rm -rf dist

# 프로덕션 빌드 생성
npm run build

# 빌드 확인 (선택사항)
npm run preview
```

### 3️⃣ 빌드 결과 확인

`dist` 폴더의 `index.html`을 확인하세요:
- ❌ 잘못된 빌드: `<script type="module" src="/src/main.jsx"></script>`
- ✅ 올바른 빌드: `<script type="module" src="/assets/index-xxxxx.js"></script>`

### 4️⃣ 배포

빌드된 `dist` 폴더의 내용만 배포 서버에 업로드하세요.

## 이미 수정된 파일

- ✅ `src/services/api.js` - 환경변수 체크 추가
- ✅ `src/services/authService.js` - localhost fallback 제거
- ✅ `vite.config.js` - 프로덕션 빌드 최적화 설정

## 추가 확인사항

1. **Vercel/Netlify 배포 시**: 환경변수를 배포 플랫폼의 설정에서도 추가해야 합니다.
2. **빌드 스크립트**: `package.json`의 `build` 스크립트가 `vite build`인지 확인하세요.

