---
name: deploy
description: maging 버전 범프 → 커밋 → GitHub 푸시 → npm publish (브라우저 인증 URL 자동 오픈)
---

maging 패키지를 배포해줘. $ARGUMENTS가 있으면 그걸 새 버전으로 사용하고, 없으면 현재 package.json의 패치 버전을 +1 해줘.

## 수행 절차

### 1단계: 버전 결정

- `package.json`에서 현재 버전 읽기
- `$ARGUMENTS`가 있으면 그 값을 새 버전으로 사용 (예: `0.1.15`)
- 없으면 패치 버전 +1 (예: `0.1.14` → `0.1.15`)

### 2단계: 버전 번프

아래 파일에서 이전 버전 → 새 버전으로 일괄 치환 (Python으로):

```
package.json
llms.txt
scripts/prompts.mjs
demo.html
dist/maging.js
dist/maging-all.js
index.html
```

- `"0.1.X"` → `"0.1.Y"` (숫자 문자열)
- `"v0.1.X"` → `"v0.1.Y"` (v 접두어)

치환 후 grep으로 이전 버전이 남아있지 않은지 확인. 남은 게 있으면 모두 수정.

### 3단계: 커밋 & 푸시

```bash
git add package.json llms.txt scripts/prompts.mjs demo.html dist/maging.js dist/maging-all.js index.html
git commit -m "chore: bump version to {새버전}"
git push origin main
```

### 4단계: npm publish

웹 인증 URL을 뽑기 위해 아래 순서로 실행:

```bash
npm publish --access public --auth-type=web 2>&1
```

출력에서 `https://www.npmjs.com/auth/cli/...` URL이 나오면 **즉시 브라우저로 열기**:

```bash
open "https://www.npmjs.com/auth/cli/..."
```

publish 성공 시 (`+ @m1kapp/maging@버전` 출력) 완료 메시지 표시.
`--auth-type=web`이 안 먹히고 OTP 에러(`EOTP`)가 나오면 사용자에게 OTP 코드를 요청해서 `npm publish --access public --otp=코드`로 재시도.

### 5단계: Vercel (GitHub 자동 배포)

GitHub push가 완료되면 Vercel이 자동 배포를 시작하므로 별도 작업 불필요. 사용자에게 아래 안내:

> GitHub 푸시 완료 — Vercel 자동 배포 시작됨.
> npm: @m1kapp/maging@{버전} publish 완료.
