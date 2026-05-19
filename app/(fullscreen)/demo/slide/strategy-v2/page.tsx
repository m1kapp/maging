import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: 'AI 활용 전략 v2 — maging',
  description: 'AI가 닿는 반경: 나 → 상급자 → 팀 동료 → 타부서 → 고객',
};

const config = {
  sidebarTitle: 'AI 활용 전략',
  sidebarDate: 'v2 · 2026.05',
  slides: [
    // ── 1. COVER ──
    {
      id: 'cover',
      cover: true,
      widgets: [{
        type: 'sectionCover',
        style: 'classic',
        kicker: 'AI WORKSHOP · 2026',
        title: 'AI가 닿는 반경',
        subtitle: '나를 위한 AI에서 멈추지 마세요. 반경이 넓어질 때마다 임팩트가 달라집니다.',
        brand: 'flow.team',
        meta: 'Confidential',
      }],
    },

    // ── 2. 현실: 설문 데이터 ──
    {
      id: 'reality',
      label: '01 · 현실',
      widgets: [{
        type: 'problemSlide',
        headline: '설문에서 드러난 **공통 고충**',
        points: [
          { icon: '🔁', title: '같은 질문, 같은 답변', desc: '경비처리, SOP 번호, 결재라인 — 하루 2회, 주 1회 이상 같은 답변을 반복합니다.' },
          { icon: '📄', title: '텍스트 공지는 안 읽힌다', desc: '매뉴얼이 있는데도 전화가 옵니다. 공지를 올려도 "어디 있어요?" 질문이 돌아옵니다.' },
          { icon: '⏱️', title: '단순 반복에 시간을 쓴다', desc: '실적 정리, 논문 요약, 메일 작성, 주간보고 — 매주 같은 형식, 매번 처음부터.' },
          { icon: '🔍', title: '흩어진 정보를 모아야 한다', desc: '규정·가이드라인·SOP가 여기저기. 맞는 정보인지 검증하는 데 또 시간.' },
        ],
        highlight: '**22명** 중 **19명**이 "자료 검색·정리에 시간이 많이 든다"고 응답했습니다.',
      }],
    },

    // ── 3. 브릿지: 질문 ──
    {
      id: 'question',
      cover: true,
      label: '02 · 질문',
      widgets: [{
        type: 'sectionCover',
        style: 'classic',
        kicker: 'QUESTION',
        title: 'AI를 어디에 쓸 것인가?',
        subtitle: '22명 모두 AI를 쓰고 싶다고 답했습니다. 문제는 "어디서부터"입니다. 가장 가까운 곳부터 시작합니다.',
        brand: 'flow AI',
      }],
    },

    // ── 4. 프레임워크: 5단계 ──
    {
      id: 'framework',
      label: '03 · Framework',
      widgets: [{
        type: 'chainFlow',
        headline: 'AI가 닿는 **5가지 반경** — 나에서 시작해 고객까지',
        steps: [
          { label: '반경 ①', title: '나', desc: '내 반복업무를 줄인다', accent: true },
          { label: '반경 ②', title: '상급자', desc: '판단 근거를 빠르게 올린다' },
          { label: '반경 ③', title: '팀 동료', desc: '안 물어봐도 되게 만든다' },
          { label: '반경 ④', title: '타부서', desc: '알아서 하게 만든다' },
          { label: '반경 ⑤', title: '고객', desc: '매출이 올라오게 만든다' },
        ],
        footer: '가장 가까운 곳부터 시작하세요. 오늘 워크샵에서 반경을 한 칸 넓혀보겠습니다.',
      }],
    },

    // ── 5. 반경 ①: 나를 위한 AI ──
    {
      id: 'level-1',
      label: '① 나 · 나',
      widgets: [{
        type: 'compareSlide',
        headline: '반경 ① — **나를 위한** AI',
        left: {
          label: 'Before',
          rows: [
            { key: '논문 요약', value: '1편에 30분, 매주 반복' },
            { key: '실적 정리', value: 'Excel 다운→Vlookup→Sumif→입력' },
            { key: '메일 작성', value: '같은 형식 매번 처음부터' },
            { key: '주간보고', value: '매주 PPT 새로 만듦' },
          ],
        },
        right: {
          label: 'After · flow AI',
          rows: [
            { key: '논문 요약', value: 'PDF 넣고 "3줄 요약" → 5분' },
            { key: '실적 정리', value: 'Raw 데이터만 넣으면 표 자동' },
            { key: '메일 작성', value: '"이 메일 영어로 번역+답장 초안"' },
            { key: '주간보고', value: '데이터 입력→리포트 자동 생성' },
          ],
        },
        note: '학술팀, RA팀, 뷰티사업팀, 합성공정팀이 여기에 해당합니다.',
      }],
    },

    // ── 6. 반경 ①: 구체 도구 ──
    {
      id: 'level-1-tools',
      label: '① 나 · 도구',
      widgets: [{
        type: 'problemSlide',
        headline: '반경 ①에서 쓰는 **flow AI 기능**',
        points: [
          { icon: '📎', title: 'CHAT + FILE', desc: 'PDF·엑셀·한글 파일 첨부 → 요약, 비교, 표 추출. 최대 10개 동시 분석.' },
          { icon: '🌐', title: 'CHAT + WEBS', desc: '웹+뉴스 통합 검색. 국가별 검색. 출처 링크 포함.' },
          { icon: '🖥️', title: 'CHAT-06 코드 미리보기', desc: '"한방 HTML로 계산기 만들어줘" → 바로 실행 가능한 도구 생성.' },
          { icon: '🖼️', title: 'IMGS 이미지 생성', desc: '발표 이미지, 인포그래픽, 배경 제거, 스타일 변환까지.' },
        ],
      }],
    },

    // ── 7. 반경 ②: 상급자를 위한 AI ──
    {
      id: 'level-2',
      label: '② 상급자 · 상급자',
      widgets: [{
        type: 'compareSlide',
        headline: '반경 ② — **상급자를 위한** AI',
        left: {
          label: 'Before',
          rows: [
            { key: '보고서', value: '데이터 수집 3시간 + 정리 2시간' },
            { key: '대시보드', value: '매번 Excel로 수동 갱신' },
            { key: '경쟁사 분석', value: '구글링 → 복붙 → 표 만들기' },
            { key: '발표 자료', value: '디자인에 반나절' },
          ],
        },
        right: {
          label: 'After · flow AI',
          rows: [
            { key: '보고서', value: '데이터 넣으면 리포트+인사이트 자동' },
            { key: '대시보드', value: '한방 HTML로 실시간 대시보드' },
            { key: '경쟁사 분석', value: '고급 답변 → 웹+내부 동시 검색→자동 비교표' },
            { key: '발표 자료', value: '프롬프트 하나면 슬라이드 완성' },
          ],
        },
        note: 'SCM팀, 전략지원실, DX전략팀이 여기에 해당합니다.',
      }],
    },

    // ── 8. 반경 ②: 고급 답변 데모 ──
    {
      id: 'level-2-deep',
      label: '② 상급자 · 고급 답변',
      widgets: [{
        type: 'chainFlow',
        headline: '**고급 답변** — 여러 AI가 동시에 심층 분석',
        steps: [
          { label: 'STEP 1', title: '의도 분석', desc: '질문을 분해하고 필요한 도구를 판단', accent: true },
          { label: 'STEP 2', title: '동시 수집', desc: 'WEBS 웹검색 + FLOW 사내검색 동시 실행' },
          { label: 'STEP 3', title: '종합 보고서', desc: '수집 데이터를 검증하고 보고서로 합성' },
        ],
        footer: '"기업 분석해줘" 한마디로 — 뉴스 수집 + 내부 자료 검색 + 종합 보고서 작성이 동시에.',
      }],
    },

    // ── 9. 반경 ③: 팀 동료를 위한 AI ──
    {
      id: 'level-3',
      label: '③ 팀 · 팀 동료',
      widgets: [{
        type: 'problemSlide',
        headline: '반경 ③ — **팀 동료를 위한** AI',
        points: [
          { icon: '💊', title: '품질팀 SOP 챗봇', desc: 'BOTS + 파일학습: PDF 매뉴얼 업로드 → "SOP-123 번호 알려줘" → 3초 답변' },
          { icon: '🔬', title: '임상정보팀 절차봇', desc: 'BOTS + FLOW 연동: 프로젝트 데이터 기반 → "이 건 진행상황 어때?" 자동 답변' },
          { icon: '📊', title: '소화팀 논문 DB', desc: 'BOTS + 파일학습: 논문 5개 업로드 → 통일된 양식으로 핵심 정보 요약' },
          { icon: '🔗', title: '팀 공유', desc: 'CHAT-09: AI 분석 결과를 팀에 바로 공유. 개인·팀·회사 범위 선택.' },
        ],
        highlight: '"안 물어봐도 되는 팀"이 곧 **강한 팀**입니다.',
      }],
    },

    // ── 10. 챗봇 만들기 데모 ──
    {
      id: 'bots-demo',
      label: '③ 팀 · 챗봇',
      widgets: [{
        type: 'chainFlow',
        headline: '챗봇 만들기 — **3분이면 끝**',
        steps: [
          { label: 'STEP 1', title: '이름 + 지침', desc: 'BOTS-01: "우리팀 SOP 가이드" 이름 짓고, 역할 지시', accent: true },
          { label: 'STEP 2', title: '파일 업로드', desc: 'BOTS-02~06: PDF, 한글, 엑셀, PPT 아무거나 올리면 학습' },
          { label: 'STEP 3', title: '공유', desc: 'BOTS-10: 팀에만? 회사 전체에? 공개 범위 선택' },
        ],
        footer: '설문 응답 22명 중 14명이 "챗봇을 만들고 싶다"고 답했습니다. 오늘 직접 만들어봅니다.',
      }],
    },

    // ── 11. 반경 ④: 타부서를 위한 AI ──
    {
      id: 'level-4',
      label: '④ 타부서 · 타부서',
      widgets: [{
        type: 'problemSlide',
        headline: '반경 ④ — **타부서를 위한** AI',
        points: [
          { icon: '💰', title: '회계팀 경비 챗봇', desc: 'BOTS + 한글파일 + 회사공개: "대금지급일 언제?" "경비 계정과목?" → 전화 0건' },
          { icon: '🏭', title: '이천지원팀 HR 챗봇', desc: 'BOTS + PDF + 회사공개: 의료비·경조·연차·교대 → 24시간 셀프서비스' },
          { icon: '📋', title: '교육팀 가이드북', desc: 'BOTS + FLOW연동 + 웹검색: 영업 매뉴얼 → 현장에서 바로 검색' },
          { icon: '🛒', title: 'SCM팀 구매 챗봇', desc: 'BOTS + PDF + 회사공개: 규정·프로세스 → 모두가 셀프서비스' },
        ],
        highlight: '핵심은 **BOTS-10 (회사 공개)**입니다. 내가 만든 챗봇이 전사를 바꿉니다.',
      }],
    },

    // ── 12. 반경 ④: 실제 설문 목소리 ──
    {
      id: 'level-4-voice',
      label: '④ 타부서 · 목소리',
      widgets: [{
        type: 'referenceTable',
        headline: '설문에서 나온 **실제 목소리**',
        columns: ['부서', '지금의 고충', '만들고 싶은 것'],
        rows: [
          { cells: ['회계팀', '같은 질문 매일. 말일에 폭주.', '회계팀만의 챗봇 1개'] },
          { cells: ['이천지원팀', '같은 질문 하루 2회. 주말/야간에도.', '언제든 답변받는 HR 챗봇'] },
          { cells: ['품질팀', 'SOP 번호가 기억 안 남. 찾는 데 허비.', 'SOP 검색 챗봇'] },
          { cells: ['SCM팀', '구매 규정·프로세스 문의 반복', '구매용 챗봇. 익명 문의도.'] },
          { cells: ['내부회계관리팀', '월별 마감실적 반복 정리', '내부고객 대응 챗봇'] },
          { cells: ['영업기획팀', '외부 영업에서 매뉴얼 검색 어려움', '업무 가이드북 AI'] },
        ],
      }],
    },

    // ── 13. 반경 ⑤: 고객을 위한 AI ──
    {
      id: 'level-5',
      label: '⑤ 고객 · 고객',
      widgets: [{
        type: 'storySlide',
        headline: '반경 ⑤ — **고객을 위한** AI',
        chapters: [
          { tag: 'Before', title: 'MR 김 대리', desc: '독감 시즌. 백신을 써달라고 말로만 설명. 병원장은 "알겠습니다" 하고 기존 거래처 백신을 씀.' },
          { tag: 'What he did', title: '전단지를 직접 만들었다', desc: 'AI로 홍보 전단지를 제작. 근처 아파트 단지를 하루 동안 직접 돌며 배포.' },
          { tag: 'Result', title: '환자가 병원으로 갔다', desc: '예방접종 문의 증가 → 병원 매출 증가 → 병원장이 먼저 "그 백신 더 보내줘" 연락.' },
        ],
        footer: '이 MR은 포토샵 자격증이 있어서 가능했습니다. <strong>AI는 모든 직원에게 이 역량을 줍니다.</strong>',
        flow: ['AI로 만들고', '직접 전달하고', '고객이 움직인다'],
      }],
    },

    // ── 14. 반경 ⑤: 구체 도구 ──
    {
      id: 'level-5-tools',
      label: '⑤ 고객 · 도구',
      widgets: [{
        type: 'problemSlide',
        headline: '반경 ⑤에서 쓰는 **flow AI 조합**',
        points: [
          { icon: '🖼️', title: 'IMGS + CHAT', desc: '고객 맞춤 전단지·카드뉴스·포스터를 AI로 직접 제작 → 거래처에 전달' },
          { icon: '🔍', title: 'WEBS + CHAT + IMGS', desc: '거래처 분석 → 맞춤 제안서 + 비주얼 자동 생성. 한방에.' },
          { icon: '🤖', title: 'BOTS + FILE + 회사공개', desc: '제품 매뉴얼 학습 → 고객용 FAQ 챗봇. 24시간 셀프서비스.' },
          { icon: '🧠', title: '고급 답변 + IMGS', desc: '시장 분석 → 경쟁사 비교 → 인포그래픽까지 한번에.' },
        ],
      }],
    },

    // ── 15. 보안: 걱정 해소 ──
    {
      id: 'security',
      label: '04 · 보안',
      widgets: [{
        type: 'chainFlow',
        headline: '민감정보 **2중 보호** — SAFE',
        steps: [
          { label: 'SAFE-01', title: '입력 마스킹', desc: '이메일·전화·주민번호 자동 감지 → 치환 후 AI 전달', accent: true },
          { label: 'SAFE-02', title: '문서 마스킹', desc: 'PDF·엑셀·한글 파일 속 민감정보도 마스킹' },
          { label: 'SAFE-04', title: '원문 복원', desc: '사용자는 원문 확인 가능. AI에게는 미전달.' },
        ],
        footer: '사용자는 원문을 그대로 보면서 사용. AI에게는 마스킹된 데이터만 전달됩니다.',
      }],
    },

    // ── 16. 설문 데이터: 지금 여러분의 반경 ──
    {
      id: 'survey-map',
      label: '05 · 여러분의 위치',
      widgets: [{
        type: 'referenceTable',
        headline: '여러분은 지금 **어디에** 있나요?',
        columns: ['부서', '원하는 것', '반경'],
        rows: [
          { cells: ['학술팀', '논문 요약 자동화', '① 나'] },
          { cells: ['RA팀', '문서 변경대비표 자동생성', '① 나'] },
          { cells: ['뷰티사업팀', '일별 판매실적 자동정리', '① 나'] },
          { cells: ['합성공정팀', '주간보고 PPT 자동화', '② 상급자'] },
          { cells: ['SCM팀', '실적 대시보드', '② 상급자'] },
          { cells: ['품질팀', 'SOP 검색 챗봇', '③ 팀 동료'] },
          { cells: ['임상정보팀', '프로젝트 절차 챗봇', '③ 팀 동료'] },
          { cells: ['회계팀', '경비처리 챗봇', '④ 타부서'] },
          { cells: ['이천지원팀', 'HR 셀프서비스 챗봇', '④ 타부서'] },
          { cells: ['ERAS팀', '거래처 맞춤 마케팅', '⑤ 고객'] },
        ],
      }],
    },

    // ── 17. 플라이휠 ──
    {
      id: 'flywheel',
      label: '06 · Flywheel',
      widgets: [{
        type: 'flywheelSlide',
        headline: '만들고 → 관리하고 → 퍼뜨리는 **플라이휠**',
        steps: [
          { title: 'AI로 만든다', desc: 'flow AI로 챗봇·리포트·콘텐츠 생성', icon: '🤖' },
          { title: 'flow로 관리', desc: '프로젝트에 저장, 업무에 연결', icon: '📋' },
          { title: '팀/회사에 공유', desc: '챗봇 공개, 결과 공유', icon: '🔗' },
          { title: '조직이 강해진다', desc: '한 명의 노하우가 전사 역량이 됨', icon: '⚙' },
        ],
        summary: { title: 'AI만 쓰면 1명. AI + flow를 쓰면 조직이 강해진다.', desc: '만든 챗봇이 팀에 공유되고, 다른 팀이 복제하고, 전사 표준이 됩니다.' },
      }],
    },

    // ── 18. 오늘 세션 타임라인 ──
    {
      id: 'session-timeline',
      label: '07 · 오늘 세션',
      widgets: [{
        type: 'timelineSlide',
        headline: '오늘 세션 — **100분**',
        milestones: [
          { date: '15분', title: '전략 공유', desc: '설문 결과 + AI가 닿는 반경 프레임', done: true },
          { date: '15분', title: '라이브 데모', desc: '반경별 핵심 기능 5가지 시연', active: true },
          { date: '40분', title: '실습', desc: '반경별 미션 직접 수행' },
          { date: '15분', title: '공유 & 발표', desc: '팀별 결과물 발표 + 피드백' },
          { date: '15분', title: 'flow 연결', desc: '결과물을 프로젝트에 저장. 플라이휠 시작' },
        ],
      }],
    },

    // ── 18-2. 실습 미션 ──
    {
      id: 'mission',
      label: '07 · 실습 미션',
      widgets: [{
        type: 'referenceTable',
        headline: '반경별 **실습 미션** — 40분',
        columns: ['반경', '미션', '프롬프트 예시', '기능'],
        rows: [
          { cells: ['① 나', '회의록을 요약하라', '"첨부한 회의록 PDF에서 결정사항·액션아이템·담당자를 표로 정리해줘"', 'CHAT + FILE'] },
          { cells: ['② 상급자', '주간보고를 만들어라', '"이 실적 데이터로 팀장님 보고용 주간 대시보드를 HTML로 만들어줘"', 'CHAT-06 코드'] },
          { cells: ['③ 팀', '우리팀 FAQ 챗봇을 만들어라', '"이 업무 매뉴얼을 학습시켜서 신입이 질문하면 답변하는 챗봇 만들어줘"', 'BOTS + FILE'] },
          { cells: ['④ 타부서', '후속 업무를 자동 생성하라', '"오늘 회의 결과를 프로젝트로 만들어줘. 업무·담당자·마감일 포함"', 'TASK 업무매니저'] },
          { cells: ['⑤ 고객', '소개 자료를 만들어라', '"우리 서비스 핵심 가치를 카드뉴스 이미지로 만들어줘"', '고급답변 + IMGS'] },
        ],
      }],
    },

    // ── 19. 증거 ──
    {
      id: 'evidence',
      label: '08 · 증거',
      widgets: [{
        type: 'chainFlow',
        headline: '이 리포트 자체가 **증거**입니다',
        steps: [
          { label: '① 나', title: '설문 데이터 분석', desc: '22명 응답 데이터를 flow AI로 분류·요약·프레임워크 도출', accent: true },
          { label: '② 상급자', title: '전략 보고서 생성', desc: '이 슬라이드 전체를 AI로 구조 설계 + 시각화' },
          { label: '④ 타부서', title: '워크샵 설계+배포', desc: '설문 기반 맞춤 커리큘럼 → 전사 교육팀에 공유' },
        ],
        footer: '"진짜 되나?" 궁금하셨을 겁니다. 이 리포트가 flow AI로 만들어진 것 자체가 답입니다.',
      }],
    },

    // ── 20. Making of ──
    {
      id: 'making-of',
      label: '09 · Making of',
      widgets: [{
        type: 'problemSlide',
        headline: '이 리포트, **이렇게** 만들었습니다',
        points: [
          { icon: '📎', title: '1. 설문 엑셀 첨부', desc: '워크샵 사전 설문 응답 22명분 엑셀 파일을 flow AI에 그대로 첨부했습니다.' },
          { icon: '💬', title: '2. 구체적인 프롬프트 1개', desc: '"이 설문 데이터를 분석해서, AI 활용 범위를 \'나→상급자→팀→타부서→고객\' 5가지 반경으로 분류하고, 각 반경마다 해당 부서와 구체적 활용사례를 매핑해서 20장짜리 전략 보고서로 만들어줘. 각 장표에 설문 원문을 인용해줘."' },
          { icon: '🎨', title: '3. 결과물 즉시 생성', desc: '설문 분석 + 프레임워크 도출 + 슬라이드 구조 + 시각화까지 한번에. 디자이너 0명, 코딩 0줄.' },
        ],
        highlight: '핵심은 **프롬프트의 구체성**입니다. 방향·구조·데이터 소스를 명확히 지시할수록 원하는 결과가 한방에 나옵니다.',
      }],
    },

    // ── 21. Next Step ──
    {
      id: 'ask',
      label: '09 · Next Step',
      widgets: [{
        type: 'askSlide',
        headline: '오늘부터 **반경을 넓혀**봅시다',
        useOfFunds: [
          { label: '오늘 실습', pct: 40 },
          { label: '2주 파일럿', pct: 35 },
          { label: '팀 확산', pct: 25 },
        ],
        milestones: [
          '오늘: 내 업무 AI 도구 1개 직접 만들기',
          '2주 내: 만든 도구를 실무에 적용하고 피드백',
          '1개월 후: 팀 단위 확산 + 성과 공유',
        ],
        contact: { email: 'hello@flow.team', website: 'flow.team' },
      }],
    },
  ],
};

export default function StrategyV2Page() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-sidebar.js', '/dist/maging-slide.js']} />;
}
