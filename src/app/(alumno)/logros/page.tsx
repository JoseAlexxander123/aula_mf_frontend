import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Kpi, PageHeader, PageSkeleton, SectionTitle } from '@/components/ui/primitives';
import { BadgeGrid, CertificateList, PortfolioGrid } from '@/features/achievements/components/achievements';
import { CopyButton } from '@/features/achievements/components/copy-button';
import { requireSession } from '@/server/auth/dal';
import { services } from '@/services';

export const metadata: Metadata = { title: 'Logros' };

export default function AchievementsPage() {
  return (
    <div className="page">
      <PageHeader title="Logros y portafolio" description="Lo que has aprendido y creado, listo para mostrar." />
      <Suspense fallback={<PageSkeleton />}>
        <AchievementsContent />
      </Suspense>
    </div>
  );
}

async function AchievementsContent() {
  const ctx = await requireSession('student');
  const { profile, badges, portfolio, certificates } = await services.students.getAchievements(ctx);
  const earned = badges.filter((b) => b.earned).length;
  const done = portfolio.filter((p) => p.status === 'done').length;

  return (
    <>
      <div className="grid-3">
        <Kpi label="Estrellas" value={`⭐ ${profile.stars}`} hint="Canjeables en la tienda del avatar" />
        <Kpi label="Insignias" value={`${earned} / ${badges.length}`} hint={`${badges.length - earned} por ganar este mes`} />
        <Kpi label="Proyectos" value={`${done} + ${portfolio.length - done}`} hint="cumplidos + en curso" />
      </div>
      <section className="section">
        <SectionTitle
          title="Portafolio · un proyecto por laboratorio"
          action={<CopyButton value={`/portafolio/${profile.id}`} label="Copiar enlace del portafolio">Compartir enlace →</CopyButton>}
        />
        <PortfolioGrid items={portfolio} />
      </section>
      <div className="split">
        <section className="section"><h2>Certificados</h2><CertificateList certificates={certificates} /></section>
        <section className="section"><h2>Insignias</h2><BadgeGrid badges={badges} /></section>
      </div>
    </>
  );
}
