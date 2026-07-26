import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projectData } from '@/data/projects';
import ProjectArticle from '@/components/article';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Per-project metadata.
 *
 * Without this, every project page inherits the root layout's
 * `alternates.canonical: "/"` and tells crawlers it's a duplicate of the
 * homepage — which de-indexes all three case studies despite sitemap.ts
 * submitting them.
 */
export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projectData.find((p) => p.id === Number(id));

  if (!project) return {};

  const url = `/projects/${project.id}`;

  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: project.title,
      description: project.description,
      images: [{ url: project.heroImage ?? project.image, alt: project.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [project.heroImage ?? project.image],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id);
  const project = projectData.find(p => p.id === projectId);

  if (!project) {
    notFound();
  }

  return <ProjectArticle project={project} />;
}

// Generate static params for all projects
export function generateStaticParams() {
  return projectData.map((project) => ({
    id: project.id.toString(),
  }));
} 