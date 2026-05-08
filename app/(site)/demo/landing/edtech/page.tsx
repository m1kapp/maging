import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: '런핏 — 기업 교육을 즐겁게 — maging',
  description: 'maging 랜딩 모드 데모. 가상의 기업교육 플랫폼 런핏을 소개합니다.',
};

const config = {
  mode: 'landing',
  sections: [
    {
      type: 'hero',
      kicker: '런핏 LearnFit',
      title: '기업 교육,\n게임처럼 즐겁게',
      subtitle: '마이크로 러닝 + AI 맞춤 커리큘럼 + 실시간 분석.\n직원이 스스로 찾아서 듣는 교육 플랫폼.',
      ctas: [
        { label: '무료 체험 시작', href: '#how', primary: true },
        { label: '데모 예약', href: '#demo' },
      ],
    },
    {
      type: 'steps',
      kicker: 'How it works',
      sectionTitle: '도입까지 3단계',
      steps: [
        {
          title: '교육 콘텐츠 업로드',
          desc: '기존 PDF, PPT, 영상을 드래그&드롭. AI가 자동으로 마이크로 러닝 모듈로 분할합니다.',
        },
        {
          title: 'AI가 맞춤 커리큘럼 생성',
          desc: '직무, 레벨, 학습 이력을 분석해 직원별 최적 학습 경로를 자동으로 구성합니다.',
        },
        {
          title: '대시보드로 성과 확인',
          desc: '이수율, 테스트 점수, 참여도를 실시간 트래킹. 관리자 보고서가 자동 생성됩니다.',
        },
      ],
    },
    {
      type: 'features',
      kicker: 'Features',
      sectionTitle: '왜 런핏인가요',
      cols: 3,
      items: [
        { icon: '⚡', title: '5분 마이크로 러닝', desc: '긴 강의 대신 5분 단위 모듈. 출퇴근길에도 학습 가능.' },
        { icon: '🎯', title: 'AI 맞춤 추천', desc: '직무·레벨·과거 성취에 맞춰 AI가 다음 학습을 추천.' },
        { icon: '🏆', title: '게이미피케이션', desc: '배지, 랭킹, 스트릭으로 자발적 학습 동기를 자극.' },
        { icon: '📊', title: '실시간 대시보드', desc: '팀별 이수율, 스킬갭 분석, ROI 지표를 한눈에.' },
        { icon: '🔗', title: 'SSO & LMS 연동', desc: 'SAML/OIDC SSO, SCORM, xAPI 지원. 기존 시스템과 바로 연결.' },
        { icon: '🛡️', title: 'ISO 27001 인증', desc: '데이터 암호화, 접근 제어, 감사 로그 완비.' },
      ],
    },
    {
      type: 'comparison',
      kicker: 'Comparison',
      sectionTitle: '기존 교육 도구와 비교',
      columns: ['런핏', 'A사 LMS', 'B사 이러닝', 'C사 HR솔루션'],
      highlight: 0,
      rows: [
        { label: 'AI 맞춤 커리큘럼', values: [true, false, false, false] },
        { label: '마이크로 러닝', values: [true, false, true, false] },
        { label: '게이미피케이션', values: [true, false, false, false] },
        { label: '모바일 앱', values: [true, true, true, false] },
        { label: '실시간 분석', values: [true, false, false, true] },
        { label: 'SSO 연동', values: [true, true, false, true] },
        { label: '무료 체험', values: ['30일', '14일', false, false] },
        { label: '도입 기간', values: ['1주', '4~8주', '2주', '8~12주'] },
      ],
    },
    {
      type: 'testimonials',
      kicker: '고객 후기',
      sectionTitle: '도입 기업의 생생한 후기',
      cols: 3,
      items: [
        {
          quote: '기존 LMS 이수율 42%에서 런핏 도입 후 94%로. 직원들이 알아서 학습합니다.',
          name: '최영은', role: 'HR 본부장, 대기업 A사', initial: 'C',
        },
        {
          quote: '5분짜리 모듈이라 거부감이 없어요. 점심시간에 한 개씩 들으니 한 달이면 과정 완료.',
          name: '박서준', role: '주니어 개발자, 스타트업', initial: 'P',
        },
        {
          quote: '교육 예산 ROI를 처음으로 수치로 보여줄 수 있게 됐습니다. 경영진 설득이 쉬워졌어요.',
          name: '김하나', role: 'L&D 매니저, 중견기업', initial: 'K',
        },
      ],
    },
    {
      type: 'faq',
      kicker: 'FAQ',
      sectionTitle: '자주 묻는 질문',
      items: [
        { q: '기존 교육 자료를 그대로 쓸 수 있나요?', a: 'PDF, PPT, MP4, SCORM 패키지 모두 지원합니다. 업로드하면 AI가 자동으로 마이크로 러닝 모듈로 분할해줍니다.' },
        { q: '몇 명부터 도입할 수 있나요?', a: '10인 이상이면 시작 가능합니다. Starter 플랜은 월 3,900원/인, Enterprise는 별도 상담입니다.' },
        { q: '자체 서버에 설치 가능한가요?', a: 'Enterprise 플랜에서 On-premise 또는 Private Cloud 배포를 지원합니다. AWS, Azure, GCP 모두 가능합니다.' },
        { q: '모바일에서도 학습할 수 있나요?', a: 'iOS, Android 앱이 있고 오프라인 다운로드도 됩니다. 웹에서도 모바일 최적화 화면으로 접속 가능합니다.' },
        { q: '데이터 보안은 어떻게 되나요?', a: 'ISO 27001 인증, AES-256 암호화, SOC 2 Type II 준수. 모든 데이터는 국내 리전에 저장됩니다.' },
      ],
    },
    {
      type: 'cta',
      title: '30일 무료로\n직접 경험해보세요',
      desc: '카드 등록 없이 바로 시작. 전체 기능을 30일간 무제한.',
      ctas: [
        { label: '무료 체험 시작', href: '#', primary: true },
        { label: '데모 예약', href: '#' },
      ],
    },
  ],
};

export default function EdtechPage() {
  return <MagingPage config={config} scripts={['/dist/maging-landing.js']} />;
}
