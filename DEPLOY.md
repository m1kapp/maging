# Deployment

## Landing page → Vercel

### Option A. GitHub 연동 (한 번 셋업, 이후 git push만)

1. [github.com](https://github.com) 에 저장소 push
   ```bash
   git init
   git add .
   git commit -m "initial: maging v0.1.0"
   git remote add origin git@github.com:m1kapp/maging.git
   git push -u origin main
   ```

2. [vercel.com](https://vercel.com) 가입 → GitHub 계정 연동

3. Dashboard → **New Project** → `maging` 저장소 import

4. 프로젝트 설정 (대부분 자동 감지, 수정 필요시):
   | 항목 | 값 |
   |---|---|
   | Framework Preset | `Other` |
   | Root Directory | `./` |
   | Build Command | (비워둠 — `vercel.json`이 처리) |
   | Output Directory | `./` |
   | Install Command | `npm install` |

5. **Deploy** 클릭 → `https://maging-<hash>.vercel.app` 자동 발급

6. 이후 `git push` 만 하면 자동 재배포

### Option B. CLI 수동 배포 (GitHub 없이)

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인 (브라우저 열림)
vercel login

# 3. 저장소 루트에서 배포
vercel

# 처음엔 몇 개 질문:
#   Set up and deploy? Y
#   Scope? (본인 계정 선택)
#   Link to existing project? N
#   Project name? maging
#   In which directory is your code located? ./
#   Override settings? N

# 4. 프로덕션 배포
vercel --prod
```

### 커스텀 도메인 연결

Vercel Dashboard → Project → **Settings → Domains** → `maging.dev` 같은 도메인 추가 → DNS 가이드 따라 CNAME/A 레코드 등록.

추천 도메인:
- `maging.dev` (가장 정식)
- `maging.app`
- `mage.sh` (짧음)
- `justmageit.com` (태그라인 살림)

---

## Library → CDN

라이브러리(`dist/maging.js`, `dist/maging.css`, `dist/themes/*.css`)는 **Vercel 말고 CDN으로** 배포합니다. Vercel은 랜딩페이지용.

### 옵션 A. jsDelivr via GitHub (가장 빠름, 계정 불필요)

```bash
# 1. GitHub public 저장소 (위 Option A와 동일)
git push origin main

# 2. 버전 태그
git tag v0.1.0
git push origin v0.1.0

# 3. 끝. 즉시 접근 가능:
# https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.js
# https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.css
# https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/themes/claude.css
```

### 옵션 B. npm publish (생태계 편입)

```bash
# 1. npm 계정 준비
npm adduser    # 처음이라면 회원가입

# 2. 이름 선점 체크
npm info maging
# 만약 이미 있으면 다른 이름 고려: "maging-ui", "usemaging", "@m1kapp/maging"

# 3. publish
npm publish --access public

# 4. URL 자동:
# https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/dist/maging.js
# https://unpkg.com/maging@0.1.0/dist/maging.js
```

### 태그별 버전 관리

- 사용자는 `v0.1.0` 같은 특정 태그를 쓰면 **불변** URL
- `@latest` 쓰면 매번 최신 (위험할 수 있음)
- 권장: 안정화 전까지는 `v0.1.0` 고정 사용 권장

---

## 배포 후 확인 체크리스트

- [ ] `https://maging.vercel.app` 랜딩 정상 로드
- [ ] `/demo.html` 접근 가능, 대시보드 렌더링
- [ ] `/llms.txt` 접근 가능, Content-Type `text/plain`
- [ ] "Copy Prompt" 버튼 동작, 클립보드 복사 성공
- [ ] LLM 바로가기 링크 (ChatGPT/Claude/Gemini 등) 정상
- [ ] 35개 테마 드롭다운 전환 정상
- [ ] CDN URL (jsDelivr) 로 라이브러리 로드 확인
- [ ] Lighthouse 점수 (Performance / Accessibility / Best Practices)

---

## 랜딩 페이지에 CDN URL 반영 (권장)

초기 배포 후, 랜딩페이지의 설치 스니펫과 prompts의 `USER` 자리표시자를 **실제 GitHub 사용자명**으로 교체하세요:

```bash
# index.html, scripts/prompts.mjs 에서 USER → 실제 사용자명 치환
```

예:
```html
<!-- Before -->
https://cdn.jsdelivr.net/gh/m1kapp/maging@v0.1.0/...

<!-- After -->
https://cdn.jsdelivr.net/gh/minho/maging@v0.1.0/...
```

그 후 `npm run count-tokens` 다시 돌려서 토큰 수 재계산 → `index.html`의 `TOKENS` 상수 업데이트.
