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
      id: 'cover', cover: true,
      widgets: [{
        type: 'sectionCover', style: 'classic',
        kicker: 'AI WORKSHOP · 2026',
        title: 'AI가 닿는 반경',
        subtitle: '나를 위한 AI에서 멈추지 마세요. 반경이 넓어질 때마다 임팩트가 달라집니다.',
        brand: 'flow.team',
        meta: 'Confidential',
      }],
    },

    // ── 2. 오늘 세션 ──
    {
      id: 'session', label: '오늘 세션',
      widgets: [{
        type: 'timelineSlide',
        headline: '오늘 세션 — **80분**',
        milestones: [
          { date: '10분', title: '왜 AI인가', desc: '설문 결과 + 반경 프레임', done: true },
          { date: '5분', title: '반경 ① 나', desc: '시연 + 실습: 파일 분석', active: true },
          { date: '5분', title: '반경 ② 상급자', desc: '시연: 대시보드 생성' },
          { date: '20분', title: '반경 ③ 팀', desc: '시연 + 실습: 챗봇 만들기' },
          { date: '5분', title: '반경 ④⑤', desc: '공유 + 고객 사례' },
          { date: '15분', title: '자유 실습', desc: '본인 업무에 적용' },
          { date: '10분', title: '공유 & QnA', desc: '결과 발표 + 질의응답' },
        ],
      }],
    },

    // ── 3. 현실: 설문 ──
    {
      id: 'reality', label: '현실',
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

    // ── 4. 프레임워크 ──
    {
      id: 'framework', label: '반경 프레임',
      widgets: [{
        type: 'chainFlow',
        headline: 'AI가 닿는 **5가지 반경**',
        steps: [
          { label: '반경 ①', title: '나', desc: '내 반복업무를 줄인다', accent: true },
          { label: '반경 ②', title: '상급자', desc: '판단 근거를 빠르게' },
          { label: '반경 ③', title: '팀 동료', desc: '안 물어봐도 되게' },
          { label: '반경 ④', title: '타부서', desc: '알아서 하게' },
          { label: '반경 ⑤', title: '고객', desc: '매출이 올라오게' },
        ],
        footer: '가장 가까운 곳부터 시작합니다. 오늘 하나씩 체험해봅니다.',
      }],
    },

    // ══════════════════════════════════════
    // 반경 ① 나
    // ══════════════════════════════════════
    {
      id: 'r1', label: '① 나',
      widgets: [{
        type: 'compareSlide',
        headline: '반경 ① — **나를 위한** AI',
        left: {
          label: 'Before',
          rows: [
            { key: '논문 요약', value: '1편에 30분' },
            { key: '실적 정리', value: 'Excel → Vlookup → 입력' },
            { key: '메일 작성', value: '같은 형식 매번 처음부터' },
          ],
        },
        right: {
          label: 'After · flow AI',
          rows: [
            { key: '논문 요약', value: 'PDF 첨부 → "3줄 요약" → 5분' },
            { key: '실적 정리', value: '엑셀 첨부 → "비교표 만들어줘"' },
            { key: '메일 작성', value: '"영어로 번역하고 답장 초안 써줘"' },
          ],
        },
      }],
    },
    {
      id: 'r1-try', label: '① 실습',
      widgets: [{
        type: 'problemSlide',
        headline: '✋ 지금 해보세요 — **파일 분석**',
        points: [
          { icon: '1️⃣', title: '파일 첨부', desc: '준비된 엑셀/PDF 파일을 flow AI에 첨부하세요.' },
          { icon: '2️⃣', title: '프롬프트 입력', desc: '"이 데이터를 월별 비교표로 정리하고 이상치를 알려줘"' },
          { icon: '3️⃣', title: '결과 확인', desc: 'AI가 만든 표를 확인하고, 추천 질문을 클릭해 더 파고들어 보세요.' },
        ],
        highlight: '💡 **꿀팁**: "코드블록으로 만들어줘"를 붙이면 서식 없이 깔끔하게 복사 → 엑셀에 바로 붙여넣기',
      }],
    },

    // ══════════════════════════════════════
    // 반경 ② 상급자
    // ══════════════════════════════════════
    {
      id: 'r2', label: '② 상급자',
      widgets: [{
        type: 'compareSlide',
        headline: '반경 ② — **상급자를 위한** AI',
        left: {
          label: 'Before',
          rows: [
            { key: '보고서', value: '데이터 수집 3시간 + 정리 2시간' },
            { key: '대시보드', value: '매번 Excel로 수동 갱신' },
            { key: '발표 자료', value: '디자인에 반나절' },
          ],
        },
        right: {
          label: 'After · flow AI',
          rows: [
            { key: '보고서', value: '데이터 넣으면 리포트 자동' },
            { key: '대시보드', value: '"대시보드 만들어줘" → 즉시 생성' },
            { key: '발표 자료', value: '프롬프트 하나면 슬라이드 완성' },
          ],
        },
        note: '🎬 시연: 엑셀 데이터 → 대시보드 즉석 생성',
      }],
    },

    // ══════════════════════════════════════
    // 반경 ③ 팀 — 핵심 실습
    // ══════════════════════════════════════
    {
      id: 'r3', label: '③ 팀',
      widgets: [{
        type: 'problemSlide',
        headline: '반경 ③ — **팀 동료를 위한** AI',
        points: [
          { icon: '💊', title: '품질팀', desc: '"SOP 번호가 기억 안 나" → 챗봇에 물으면 3초' },
          { icon: '💰', title: '회계팀', desc: '"같은 질문 매일, 말일에 폭주" → 챗봇으로 전화 0건' },
          { icon: '🏭', title: '지원팀', desc: '"주말/야간에도 질문" → 24시간 셀프서비스' },
        ],
        highlight: '설문 **22명 중 14명**이 "챗봇을 만들고 싶다"고 답했습니다.',
      }],
    },
    {
      id: 'r3-how', label: '③ 만드는 법',
      widgets: [{
        type: 'chainFlow',
        headline: '챗봇 만들기 — **3분이면 끝**',
        steps: [
          { label: 'STEP 1', title: '이름 + 지침', desc: '"우리팀 FAQ 도우미" — 이름과 역할을 알려주세요', accent: true },
          { label: 'STEP 2', title: '파일 업로드', desc: 'PDF, 한글, 엑셀, PPT 아무거나 올리면 학습' },
          { label: 'STEP 3', title: '질문 테스트', desc: '동료가 자주 묻는 질문으로 확인' },
        ],
        footer: '이 3단계를 지금 직접 해봅니다.',
      }],
    },
    {
      id: 'r3-tip', label: '③ 지침 꿀팁',
      widgets: [{
        type: 'compareSlide',
        headline: '💡 지침 한 줄이 **답변 품질**을 바꿉니다',
        left: {
          label: '지침 없이',
          rows: [
            { key: '질문', value: '"경비처리 마감일?"' },
            { key: '답변', value: '"매월 25일입니다."' },
            { key: '느낌', value: '맞긴 한데... 이것만?' },
          ],
        },
        right: {
          label: '지침 있을 때',
          rows: [
            { key: '질문', value: '"경비처리 마감일?"' },
            { key: '답변', value: '① 25일까지 ② 규정 3조 근거 ③ 주말이면 직전 영업일' },
            { key: '느낌', value: '전화 안 해도 되겠다!' },
          ],
        },
        note: '추천 지침: "답변은 ① 결론 ② 근거 ③ 주의사항 구조로. 모르면 담당자 연락처 안내."',
      }],
    },
    {
      id: 'r3-try', label: '③ 실습',
      widgets: [{
        type: 'problemSlide',
        headline: '✋ 지금 해보세요 — **챗봇 만들기** (15분)',
        points: [
          { icon: '1️⃣', title: '챗봇 생성', desc: 'flow AI → 챗봇 → 새로 만들기. 이름: "OO팀 FAQ 도우미"' },
          { icon: '2️⃣', title: '지침 작성', desc: '"답변은 ① 결론 ② 근거 ③ 주의사항 구조로. 모르는 건 담당자 연락처를 안내하세요."' },
          { icon: '3️⃣', title: '파일 업로드', desc: '팀 매뉴얼/규정 문서 올리기. 없으면 강사 제공 샘플 사용.' },
          { icon: '4️⃣', title: '테스트 & 개선', desc: '질문 3개 해보고, 답변이 부족하면 지침을 한 줄 더 추가해보세요.' },
        ],
        highlight: '💡 **지침 추가 팁**: "표로 정리해서 답변" / "이모지 쓰지 마" / "3문장 이내로" → 스타일 조절 가능',
      }],
    },

    // ══════════════════════════════════════
    // 반경 ④⑤
    // ══════════════════════════════════════
    {
      id: 'r4', label: '④ 타부서',
      widgets: [{
        type: 'problemSlide',
        headline: '반경 ④ — 만든 챗봇을 **공유**하면',
        points: [
          { icon: '🔓', title: '회사 전체 공개', desc: '방금 만든 챗봇 → 공개 범위를 "회사 전체"로 → 전사 셀프서비스 시작' },
          { icon: '📋', title: '업무 자동 생성', desc: '"오늘 회의 결과를 프로젝트로 만들어줘" → 업무·담당자·마감일 자동' },
          { icon: '🔗', title: '대화 공유', desc: 'AI 분석 결과를 공유 버튼 한 번으로 팀에 전달 → 보고서 작성 불필요' },
        ],
        highlight: '💡 챗봇 공유 버튼 하나로 **내 3시간 → 전사 0분**이 됩니다.',
      }],
    },
    {
      id: 'r5', label: '⑤ 고객',
      widgets: [{
        type: 'storySlide',
        headline: '반경 ⑤ — **고객을 위한** AI',
        chapters: [
          { tag: 'Before', title: 'MR 김 대리', desc: '백신을 써달라고 말로만 설명. 병원장은 기존 거래처 백신을 씀.' },
          { tag: 'What', title: '전단지를 만들었다', desc: 'AI로 홍보 전단지 제작. 아파트 단지를 직접 돌며 배포.' },
          { tag: 'Result', title: '환자가 왔다', desc: '문의 증가 → 병원 매출 증가 → 병원장이 먼저 연락.' },
        ],
        footer: 'AI는 모든 직원에게 <strong>콘텐츠 제작 역량</strong>을 줍니다.',
        flow: ['AI로 만들고', '직접 전달하고', '고객이 움직인다'],
      }],
    },

    // ── 워크샵 프로젝트 ──
    {
      id: 'project', label: '📌 결과 공유',
      widgets: [{
        type: 'problemSlide',
        headline: '📌 워크샵 프로젝트에 **결과를 올려주세요**',
        points: [
          { icon: '1️⃣', title: 'flow 프로젝트 입장', desc: '강사가 공유한 "AI 워크샵" 프로젝트에 들어가세요.' },
          { icon: '2️⃣', title: '게시글 작성', desc: '제목: [팀명] 실습 결과. 본문에 만든 챗봇 이름, 용도, 지침을 적어주세요.' },
          { icon: '3️⃣', title: '캡처 첨부', desc: '챗봇 답변 화면을 캡처해서 첨부하거나, 대화 공유 링크를 붙여주세요.' },
          { icon: '4️⃣', title: '동료 결과 구경', desc: '다른 팀이 올린 결과물에 댓글로 피드백 남겨보세요.' },
        ],
        highlight: '💡 이 프로젝트가 워크샵 이후에도 **AI 활용 사례 허브**가 됩니다. 계속 올려주세요!',
      }],
    },

    // ══════════════════════════════════════
    // 자유 실습
    // ══════════════════════════════════════
    {
      id: 'free-try', label: '자유 실습',
      widgets: [{
        type: 'referenceTable',
        headline: '✋ 자유 실습 — **15분**',
        columns: ['해보고 싶은 것', '이렇게 말해보세요', '기능'],
        rows: [
          { cells: ['내 문서 요약', '"첨부한 PDF 핵심 3줄로 정리해줘"', '파일 분석'] },
          { cells: ['대시보드 만들기', '"이 엑셀로 보고용 대시보드 만들어줘"', '도구 만들기'] },
          { cells: ['챗봇 하나 더', '"신입 온보딩 가이드 챗봇 만들어줘"', '챗봇'] },
          { cells: ['후속 업무 생성', '"회의 결과를 프로젝트로 만들어줘"', '업무 생성'] },
          { cells: ['이미지 만들기', '"서비스 소개 카드뉴스 이미지 만들어줘"', '이미지'] },
          { cells: ['경쟁사 분석', '"A사 vs B사 비교표 만들어줘"', '고급 답변'] },
        ],
      }],
    },

    // ══════════════════════════════════════
    // 마무리
    // ══════════════════════════════════════
    {
      id: 'making-of', label: 'Making of',
      widgets: [{
        type: 'problemSlide',
        headline: '이 리포트, **이렇게** 만들었습니다',
        points: [
          { icon: '📎', title: '1. 설문 엑셀을 첨부하고', desc: '사전 설문 22명분 엑셀 파일을 flow AI에 그대로 올렸습니다.' },
          { icon: '💬', title: '2. 이렇게 말했습니다', desc: '"이 설문으로 AI 워크샵 슬라이드 만들어줘. 나→상급자→팀→타부서→고객 5단계로 나눠서, 각 단계에 설문 데이터 매핑해줘. 챗봇 실습도 넣어줘. 17장 정도로."' },
          { icon: '🎨', title: '3. 바로 나왔습니다', desc: '설문 분석 + 프레임워크 + 17장 슬라이드가 한번에. 디자이너 0명.' },
        ],
        highlight: '핵심: **"뭘 만들지 + 어떤 구조로 + 어떤 데이터로"**를 한 문장에 담으면 한방에 나옵니다.',
      }],
    },
    {
      id: 'next', label: 'Next Step',
      widgets: [{
        type: 'askSlide',
        headline: '오늘부터 **반경을 넓혀**봅시다',
        useOfFunds: [
          { label: '오늘 실습', pct: 40 },
          { label: '2주 파일럿', pct: 35 },
          { label: '팀 확산', pct: 25 },
        ],
        milestones: [
          '오늘: 챗봇 1개를 들고 나갑니다',
          '2주 내: 실무에 적용하고 피드백',
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
