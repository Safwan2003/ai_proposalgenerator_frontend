'use client';

import dynamic from 'next/dynamic';

const ClientSideSectionCard = dynamic(() => import('./ClientSideSectionCard'), { ssr: false });

export default function SectionCard(props) {
  return <ClientSideSectionCard {...props} />;
}
