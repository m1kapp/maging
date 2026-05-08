import { Metadata } from 'next';
import { MagingPage } from '@/components/MagingPage';

export const metadata: Metadata = {
  title: 'maging Launch Week — maging',
  description: 'maging Launch Week — 5월 12-16일, 킥오프부터 클로징까지 5일간의 프로덕트 런치 이벤트.',
};

const config = {
  mode: 'landing',
  sections: [
    {
      type: 'hero',
      kicker: 'maging Launch Week',
      title: '5일간의 특별 이벤트',
      subtitle: '2026년 5월 12일 — 16일 · 프로덕트 런치, 워크숍, 해커톤을 한자리에.',
      ctas: [
        { label: '참가 등록', href: '#pricing', primary: true },
        { label: '프로그램 보기', href: '#program' },
      ],
    },
    {
      type: 'features',
      kicker: 'Program',
      sectionTitle: '5일간의 여정',
      sectionDesc: '매일 새로운 세션과 경험이 준비되어 있습니다.',
      cols: 3,
      items: [
        { icon: '▶', title: 'Day 1 · 킥오프', desc: '제품 비전 발표와 로드맵 공개. 네트워킹 리셉션 포함.' },
        { icon: '⚙', title: 'Day 2 · 워크숍', desc: 'Hands-on 세션 4개 동시 진행. 실습 중심.' },
        { icon: '⌨', title: 'Day 3 · 해커톤', desc: '24시간 빌드 챌린지. 우승팀 상금 300만원.' },
        { icon: '◎', title: 'Day 4 · 쇼케이스', desc: '해커톤 결과물 발표 + 파트너사 라이트닝 토크.' },
        { icon: '★', title: 'Day 5 · 클로징', desc: '시상식, 차기 버전 프리뷰, 애프터파티.' },
      ],
    },
    {
      type: 'logos',
      items: [
        { name: 'Vercel' }, { name: 'Supabase' }, { name: 'Toss' },
        { name: 'Wanted' }, { name: 'Inflearn' }, { name: 'Disquiet' },
      ],
    },
    {
      type: 'pricing',
      kicker: 'Tickets',
      sectionTitle: '참가 티어',
      sectionDesc: '모든 티어에 온라인 라이브 스트리밍이 포함됩니다.',
      plans: [
        {
          name: 'Online',
          desc: '어디서든 참여',
          price: '무료',
          features: [
            '전 세션 라이브 스트리밍',
            '녹화본 7일 제공',
            '온라인 Q&A 참여',
            '디지털 굿즈 팩',
          ],
          cta: { label: '무료 등록', href: '#' },
        },
        {
          name: 'Pro',
          desc: '오프라인 풀 액세스',
          price: '₩99,000',
          period: '1회',
          popular: true,
          badge: 'Best Value',
          features: [
            'Online 전체 포함',
            '5일 오프라인 참석',
            '워크숍 실습 좌석',
            '점심 + 커피 제공',
            '네트워킹 리셉션',
          ],
          cta: { label: '등록하기', href: '#' },
        },
        {
          name: 'VIP',
          desc: '프리미엄 경험',
          price: '₩299,000',
          period: '1회',
          features: [
            'Pro 전체 포함',
            '스피커 1:1 미팅 (30분)',
            'VIP 라운지 이용',
            '해커톤 멘토 배정',
            '한정판 굿즈 박스',
            '애프터파티 VIP석',
          ],
          cta: { label: 'VIP 등록', href: '#' },
        },
      ],
    },
    {
      type: 'testimonials',
      kicker: 'Reviews',
      sectionTitle: '지난 이벤트 참가자 후기',
      cols: 3,
      items: [
        {
          quote: '해커톤에서 만든 프로토타입이 지금 회사 핵심 제품이 됐습니다. 이 이벤트 아니었으면 시작도 못 했을 거예요.',
          name: '김도현', role: '풀스택 개발자', initial: 'K',
        },
        {
          quote: '스피커 라인업이 진짜였어요. 평소 블로그로만 보던 분들이랑 직접 얘기할 수 있다는 게 VIP 티켓값을 했습니다.',
          name: '이수진', role: 'PM @ 시리즈B', initial: 'L',
        },
        {
          quote: '네트워킹이 억지스럽지 않아서 좋았어요. 자연스럽게 대화하다가 협업까지 이어진 케이스가 3건.',
          name: '박준혁', role: '프리랜서 디자이너', initial: 'P',
        },
      ],
    },
    {
      type: 'cta',
      kicker: 'Limited Seats',
      title: '좌석이 한정되어 있습니다',
      desc: '오프라인 참가는 선착순 120명. 온라인은 제한 없이 무료입니다.',
      ctas: [
        { label: '참가 등록', href: '#pricing', primary: true },
        { label: '프로그램 상세', href: '#program' },
      ],
    },
    {
      type: 'faq',
      kicker: 'FAQ',
      sectionTitle: '자주 묻는 질문',
      items: [
        { q: '장소가 어디인가요?', a: '서울 성수동 일대입니다. 정확한 주소는 등록 확인 메일로 안내드려요.' },
        { q: '환불 가능한가요?', a: '네. 행사 7일 전까지 100% 환불됩니다. 3일 전까지는 50%.' },
        { q: '온라인으로만 참여해도 되나요?', a: '당연하죠. 무료 Online 티어로 전 세션 라이브 시청 가능합니다.' },
        { q: '해커톤은 팀으로 참가하나요?', a: '1~4인 팀이면 됩니다. 혼자 와서 현장에서 팀 빌딩도 가능해요.' },
        { q: '주차 지원 되나요?', a: '주차 공간이 제한적이라 대중교통을 권장합니다. 성수역 도보 5분.' },
        { q: '식사가 포함되나요?', a: 'Pro/VIP 티어는 점심 + 오후 커피가 포함됩니다. Online 티어는 해당 없어요.' },
      ],
    },
  ],
};

export default function CampaignPage() {
  return <MagingPage config={config} scripts={['/dist/maging-landing.js']} />;
}
