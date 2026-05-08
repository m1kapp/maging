import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '전략 보고서 — maging',
  description: 'maging 슬라이드 모드 데모. 전략 리뷰 보고서.',
};

const config = {
  mode: 'pitch',
  sidebarTitle: 'AI 활용 전략',
  sidebarDate: 'Strategy · 2026.05',  slides: [
    {
      id: 'cover',
      cover: true,
      widgets: [{
        type: 'pitchCover',
        company: '고객의 고객을 위한\n<span style="color:var(--mw-accent)">AI 활용</span> 전략',
        tagline: 'AI가 내부 업무를 편하게 해주는 건 이미 다 아는 이야기입니다.\n우리가 제안하는 건 그 다음 단계입니다.',
        subtitle: 'STRATEGY REPORT · MAY 2026',
        style: 'minimal',
      }],
    },
    {
      id: 'chain',
      label: '01 · Value Chain',
      widgets: [{
        type: 'chainFlow',
        headline: '가치 체인 — 3단 전달 구조',
        steps: [
          { label: 'FLOW AI', title: 'AI로 만든다', desc: 'AI 콘텐츠 생성 + 업무 관리 + 데이터 분석', accent: true },
          { label: 'YOUR TEAM', title: '직원이 무장된다', desc: '영업, 마케팅, BD — 고객 접점의 역량이 증폭됩니다' },
          { label: 'END CUSTOMER', title: '고객이 사로잡힌다', desc: '거래처·파트너사·환자가 먼저 찾아옵니다' },
        ],
        footer: '경영진이 귀를 여는 건 "업무 효율화"가 아니라 "매출 성장" 프레이밍입니다.',
      }],
    },
    {
      id: 'problem',
      label: '02 · Problem',
      widgets: [{
        type: 'problemSlide',
        headline: '기존 AI 세일즈는 틀린 질문을 하고 있다',
        points: [
          { icon: '⏱️', title: '"업무 효율이 올라갑니다"', desc: '경영진 반응: "근데 지금도 되긴 되는데…" 비용 절감 프레이밍은 도입 동기가 약합니다.' },
          { icon: '💰', title: '"시간이 절약됩니다"', desc: '실무자는 체감 못 합니다. 절약된 시간은 다른 업무로 채워질 뿐.' },
          { icon: '🤖', title: '"AI 시대에 뒤처지면 안 됩니다"', desc: '"그건 맞는데, 당장 뭘 하라고?" 공포 마케팅은 구체적 행동으로 이어지지 않습니다.' },
        ],
        highlight: '근본 원인: 도구의 가치를 내부 효율에만 국한 → ROI가 모호해진다.',
      }],
    },
    {
      id: 'scene',
      label: '03 · 실제 사례',
      widgets: [{
        type: 'storySlide',
        headline: '실제로 있었던 일입니다',
        chapters: [
          { tag: 'Before', title: 'MR 김 대리', desc: '독감 시즌. 우리 백신을 써달라고 말로만 설명. 병원장은 "알겠습니다" 하고 기존 거래처 백신을 씀.' },
          { tag: 'What he did', title: '전단지를 직접 만들었다', desc: 'AI로 "플루아릭스테트라" 홍보 전단지를 제작. 근처 아파트 단지를 하루 동안 직접 돌며 배포.' },
          { tag: 'Result', title: '환자가 병원으로 갔다', desc: '예방접종 문의 증가 → 병원 매출 증가 → 병원장이 먼저 "그 백신 더 보내줘" 연락.' },
        ],
        footer: '이 MR은 포토샵 자격증이 있어서 가능했습니다. <strong>AI는 모든 MR에게 이 역량을 줍니다.</strong>',
        flow: ['AI로 전단지를 만들고', 'MR이 직접 뿌리고', '환자가 병원에 간다'],
      }],
    },
    {
      id: 'insight',
      cover: true,
      label: '04 · Insight',
      widgets: [{
        type: 'pitchCover',
        company: 'AI가 있으면\n한 사람이 만들 수 있는\n<span style="color:var(--mw-accent)">가치의 폭</span>이 달라진다',
        tagline: '전단지뿐이 아닙니다. 리포트, 교육 자료, 캠페인, 분석까지.\n이걸 체계적으로 하면 어떻게 될까요?',
        style: 'bold',
      }],
    },
    {
      id: 'framework',
      label: '05 · Framework',
      widgets: [{
        type: 'chainFlow',
        headline: '이 사례를 구조화하면 — 가치 체인 3단 전달',
        steps: [
          { label: 'OUR PLATFORM', title: 'flow + flow AI', desc: 'AI 콘텐츠 생성 + 업무 관리 + 데이터 분석', accent: true },
          { label: '무장시킴', title: '기업 고객의 직원', desc: '영업, 마케팅, BD — 고객 접점의 역량 증폭' },
          { label: '사로잡음', title: '그들의 고객', desc: '병원, 거래처, 파트너사 — 최종 고객이 먼저 찾아온다' },
        ],
        footer: 'MR의 고객은 병원이고, 병원의 고객은 환자입니다. 환자가 오게 만들면, 병원이 먼저 찾아옵니다.',
      }],
    },
    {
      id: 'case-profile',
      label: '06 · Case Study',
      widgets: [{
        type: 'problemSlide',
        headline: 'HK이노엔에 적용하면? — 사전 정보',
        points: [
          { icon: '💊', title: '케이캡 = K-신약 30호', desc: '국산 신약 매출 TOP 3. 55개국 글로벌 계약. 2028 목표 100개국.' },
          { icon: '🇺🇸', title: 'FDA NDA 제출 완료', desc: '5월 DDW 3상 데이터 공개. 성공 시 2027년 미국 출시.' },
          { icon: '⚖️', title: '비만약 임상 3상', desc: '에크노글루타이드 — K-신약 39~40호 후보. 글로벌 비만약 시장 130조(2030).' },
          { icon: '📈', title: '이익 체질 개선', desc: '1Q 영업이익 +30.8%. 매출 순위 8위→6위. 성장률 1위.' },
        ],
      }],
    },
    {
      id: 'case-data',
      label: '06 · 핵심 지표',
      widgets: [{
        type: 'metricHighlight',
        metrics: [
          { value: '1조+', unit: '', label: '연매출 (2025)\n제약 매출 6위' },
          { value: '30호', unit: '', label: 'K-신약 케이캡\n매출 TOP 3' },
          { value: '55', unit: '개국', label: '글로벌 계약\n2028 목표 100개국' },
          { value: 'FDA', unit: '', label: '미국 NDA 제출\nDDW 데이터 공개' },
        ],
      }],
    },
    {
      id: 'support',
      label: '07 · 3가지 서포트',
      widgets: [{
        type: 'chainFlow',
        headline: 'AI가 직원에게 주는 세 가지 서포트',
        steps: [
          { label: 'SUPPORT 1', title: '마케팅', desc: '홍보 전단지 · 시즌 캠페인 · SNS 콘텐츠 · 건강 칼럼을 직접 만든다', accent: true },
          { label: 'SUPPORT 2', title: '데이터 분석', desc: '경쟁 분석 · 시즌 인사이트 · 처방 트렌드 · 환자 패턴을 읽는다' },
          { label: 'SUPPORT 3', title: '운영', desc: '간호사 교육 · 복약 안내 · 접수 체크리스트 · SOP로 퍼뜨린다' },
        ],
        footer: '전단지는 시작일 뿐입니다. AI가 있으면 한 사람이 마케팅·분석·운영 세 가지 지원을 동시에 받습니다.',
      }],
    },
    {
      id: 'deepdive-mr',
      label: '07-1 · 전문의약품',
      widgets: [{
        type: 'deepDiveSlide',
        role: {
          from: { label: 'Employee', name: 'MR (영업사원)' },
          to: { label: 'Customer', name: '병원 / 의사' },
          message: '영업을 넘어 가치를 직접 만든다',
        },
        columns: [
          { title: '마케팅', items: [
            { title: '홍보 전단지', desc: '위내시경·건강검진 홍보물을 AI로 제작, 인근 아파트 배포' },
            { title: '시즌 캠페인', desc: '독감·대상포진 시즌별 예방접종 포스터 제작' },
            { title: '병원 SNS 콘텐츠', desc: '인스타 카드뉴스 5장 + 캡션 한 번에 생성' },
            { title: '건강 칼럼', desc: '병원 블로그에 올릴 질환별 건강 정보 초안 작성' },
          ]},
          { title: '데이터 분석', items: [
            { title: '경쟁 병원 분석', desc: '반경 3km 내 경쟁 병원 대비 차별화 포인트 도출' },
            { title: '시즌 인사이트', desc: '환절기 GERD 30%↑ 등 계절 트렌드 → 캠페인 연결' },
            { title: '처방 트렌드', desc: '엑셀 데이터를 30초 만에 시각화 대시보드로 변환' },
            { title: '환자 패턴 분석', desc: '재방문율·이탈 시점 파악 → 타겟 마케팅 제안' },
          ]},
          { title: '운영', items: [
            { title: '간호사 교육 자료', desc: '케이캡 적응증·복용법·부작용 대응 가이드' },
            { title: '건강 상식 웹툰', desc: '환자 대기실용 질환 예방·관리 만화 콘텐츠' },
            { title: '복약 안내서', desc: '환자에게 전달할 약 복용법 A4 한 장 요약' },
            { title: '접수 체크리스트', desc: '건강검진 사전 안내·준비사항 체크시트' },
          ]},
        ],
      }],
    },
    {
      id: 'deepdive-hbb',
      label: '07-2 · HB&B 영업',
      widgets: [{
        type: 'deepDiveSlide',
        role: {
          from: { label: 'Employee', name: '컨디션 영업사원' },
          to: { label: 'Customer', name: '편의점 / 마트 바이어' },
          message: '영업을 넘어 가치를 직접 만든다',
        },
        columns: [
          { title: '마케팅', items: [
            { title: '매대 POP 디자인', desc: '"금요일엔 컨디션" 요일별·시즌별 매대 시안 제작' },
            { title: '프로모션 포스터', desc: '1+1, 묶음 할인 등 판촉 시각물 즉시 생성' },
            { title: '편의점 SNS 콜라보', desc: '점주가 바로 올릴 수 있는 인스타 콘텐츠 제공' },
          ]},
          { title: '데이터 분석', items: [
            { title: '요일별 판매 분석', desc: '금요일 매출 3배 등 패턴 파악 → 재고 최적화' },
            { title: '시즌 수요 예측', desc: '연말·휴가철 성수기 발주량 가이드 리포트' },
            { title: '경쟁사 모니터링', desc: '가격·프로모션·신제품 비교 보고서' },
          ]},
          { title: '운영', items: [
            { title: '알바생 교육 카드', desc: '30초 안에 읽고 설명할 수 있는 제품 요약' },
            { title: '진열 가이드', desc: '냉장고·매대별 최적 배치 매뉴얼' },
            { title: '고객 응대 스크립트', desc: 'POS에서 바로 참고할 추천·응대 가이드' },
          ]},
        ],
      }],
    },
    {
      id: 'flywheel',
      label: '08 · Flywheel',
      widgets: [{
        type: 'flywheelSlide',
        headline: '마케팅·분석·운영을 지탱하는 플라이휠',
        steps: [
          { title: 'AI로 해낸다', desc: 'AI를 사용하여 마케팅 자료를 생성합니다.', icon: '🤖' },
          { title: 'flow로 관리', desc: '고객별 프로젝트를 관리합니다.', icon: '📋' },
          { title: 'flow에서 공유', desc: '성공 사례를 공유합니다.', icon: '🔗' },
          { title: '조직이 강해진다', desc: '조직의 역량을 강화합니다.', icon: '⚙' },
        ],
        summary: { title: 'AI는 만들고, flow는 관리하고 퍼뜨린다', desc: 'AI만 쓰면 1명. AI + flow를 쓰면 체계적으로 잘하는 조직이 됩니다.' },
      }],
    },
    {
      id: 'compare-why',
      label: '09 · Why This Works',
      widgets: [{
        type: 'compareSlide',
        headline: '왜 이 전략이 강력한가',
        left: {
          label: '기존 접근',
          rows: [
            { key: '프레이밍', value: '업무 효율화' },
            { key: '도입 근거', value: '비용 절감' },
            { key: '설득 대상', value: '실무자' },
            { key: 'KPI', value: '사용률' },
            { key: '워크샵 후', value: '"편하긴 한데…"' },
            { key: '지속성', value: '낮음' },
          ],
        },
        right: {
          label: '새로운 접근',
          rows: [
            { key: '프레이밍', value: '매출 성장' },
            { key: '도입 근거', value: '매출 기여' },
            { key: '설득 대상', value: '경영진까지' },
            { key: 'KPI', value: '고객 반응, 매출' },
            { key: '워크샵 후', value: '"다음 주에 써먹어야지"' },
            { key: '지속성', value: '높음' },
          ],
        },
        note: '비용 절감이 아니라 매출 성장으로 프레이밍하면, 경영진이 움직인다.',
      }],
    },
    {
      id: 'scale',
      label: '10 · Scale',
      widgets: [{
        type: 'compareSlide',
        headline: '한 명이 아니라 전원이 할 수 있다',
        left: {
          label: 'AI 없이',
          rows: [
            { key: '전단지', value: '포토샵 아는 1명만' },
            { key: '리포트', value: '엑셀 잘하는 1명만' },
            { key: '교육 자료', value: '본사 마케팅팀 요청' },
            { key: '속도', value: '요청 → 대기 → 수령' },
          ],
        },
        right: {
          label: 'AI + flow',
          rows: [
            { key: '전단지', value: '모든 MR이 직접' },
            { key: '리포트', value: '모든 MR이 직접' },
            { key: '교육 자료', value: '모든 MR이 직접' },
            { key: '속도', value: '필요 → 생성 → 즉시 배포' },
          ],
        },
        note: '한 명만 할 수 있던 일을 전원이 하게 만드는 것. 그것이 규모화(scale)입니다.',
      }],
    },
    {
      id: 'workshop',
      label: '11 · Workshop',
      widgets: [{
        type: 'timelineSlide',
        headline: '워크샵 설계 — 100분',
        milestones: [
          { date: '10분', title: '현실 직시', desc: 'MR 차별화의 필요성', done: true },
          { date: '10분', title: '라이브 데모', desc: '담당 병원 전단지 즉석 생성', done: true },
          { date: '30분', title: '실습', desc: '담당 거래처 1곳, AI로 콘텐츠 3개 제작', active: true },
          { date: '15분', title: '공유 & 피드백', desc: '팀별 발표' },
          { date: '15분', title: 'flow 연결', desc: '거래처별 프로젝트 저장. 플라이휠 시작' },
        ],
      }],
    },
    {
      id: 'evidence',
      label: '12 · 증거',
      widgets: [{
        type: 'chainFlow',
        headline: '이 리포트 자체가 증거입니다',
        steps: [
          { label: '마케팅', title: '맞춤 전략 리포트', desc: 'HK이노엔 맞춤 전략 리포트, 워크샵 시나리오, HTML 산출물 — 모두 flow AI로 제작', accent: true },
          { label: '데이터 분석', title: '시장 · 경쟁 분석', desc: '실적/파이프라인/FDA 분석, MR 페인포인트 진단, 경쟁사 비교 — 웹 검색 + 문서 분석' },
          { label: '운영', title: '워크샵 + 플레이북', desc: '내부 워크샵 설계, 부서별 액션 플랜, 세일즈 플레이북 — 프로젝트 관리 + 업무 할당' },
        ],
        footer: '"진짜 되나?" 궁금하셨을 겁니다. 이 리포트 자체가 flow AI로 만들어졌습니다.',
      }],
    },
    {
      id: 'ask',
      label: '13 · Next Step',
      widgets: [{
        type: 'askSlide',
        headline: 'Beyond Collaboration',
        useOfFunds: [
          { label: '킥오프 워크샵', pct: 30 },
          { label: '파일럿 (20명)', pct: 40 },
          { label: '전사 확대', pct: 30 },
        ],
        milestones: [
          '1주 내 킥오프 워크샵 일정 확정',
          '파일럿 팀 20명 선발 — 전문의약품 MR 우선',
          '3개월 후 전사 확대 여부 결정',
        ],
        contact: { email: 'hello@flow.team', website: 'flow.team' },
      }],
    },
  ],
};

export default function StrategyPage() {
  return <MagingPage config={config} fullscreen scripts={['/dist/maging-sidebar.js', '/dist/maging-pitch.js']} />;
}
