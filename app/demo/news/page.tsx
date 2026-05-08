import { Metadata } from 'next';
import { LegacyPage } from '@/components/LegacyPage';

export const metadata: Metadata = { title: '카드뉴스 — maging' };

export default function Page() {
  return <LegacyPage fullscreen src="/legacy/card-news/index.html" />;
}
