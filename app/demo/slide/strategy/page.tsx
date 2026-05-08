import { Metadata } from 'next';
import { LegacyPage } from '@/components/LegacyPage';

export const metadata: Metadata = { title: 'strategy — maging' };

export default function Page() {
  return <LegacyPage fullscreen src="/legacy/slide/strategy.html" />;
}
