import { Metadata } from 'next';
import { LegacyPage } from '@/components/LegacyPage';
export const metadata: Metadata = { title: 'pitch — maging' };
export default function Page() { return <LegacyPage fullscreen src="/legacy/slide/pitch-deck.html" />; }
