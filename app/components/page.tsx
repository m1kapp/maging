import { Metadata } from 'next';
import { Suspense } from 'react';
import ComponentsGallery from './ComponentsGallery';

export const metadata: Metadata = {
  title: 'Components — maging',
  description: 'maging 위젯 갤러리. 모드별 컴포넌트를 확인하세요.',
};

export default function ComponentsPage() {
  return (
    <Suspense>
      <ComponentsGallery />
    </Suspense>
  );
}
