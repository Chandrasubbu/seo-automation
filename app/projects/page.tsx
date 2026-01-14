import { ProjectManager } from '@/components/ProjectManager';

export const metadata = {
  title: 'SEO Projects | SEO Automation',
  description: 'Manage your SEO analysis projects'
};

export default function ProjectsPage() {
  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8">
      <ProjectManager />
    </main>
  );
}
