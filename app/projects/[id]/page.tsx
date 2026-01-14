import { ProjectDetails } from '@/components/ProjectDetails';

export const metadata = {
  title: 'Project Details | SEO Automation',
  description: 'View and manage project details'
};

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8">
      <ProjectDetails projectId={params.id} />
    </main>
  );
}
