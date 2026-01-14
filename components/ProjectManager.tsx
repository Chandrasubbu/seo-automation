'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, FolderOpen, Edit2 } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  targetKeyword?: string;
  clientUrl: string;
  status: string;
  websites: any[];
  createdAt: string;
}

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetKeyword: '',
    clientUrl: '',
    websites: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const websites = formData.websites
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          targetKeyword: formData.targetKeyword,
          clientUrl: formData.clientUrl,
          websites
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const data = await res.json();
      setProjects([data.project, ...projects]);
      setFormData({
        name: '',
        description: '',
        targetKeyword: '',
        clientUrl: '',
        websites: ''
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating project:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting project:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Projects</h1>
          <p className="text-gray-600 mt-1">Manage your SEO analysis projects</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create Project Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Add a new SEO analysis project with competitor websites</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name *</label>
                  <Input
                    placeholder="e.g., E-commerce Site Analysis"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Client URL *</label>
                  <Input
                    placeholder="https://example.com"
                    value={formData.clientUrl}
                    onChange={(e) => setFormData({ ...formData, clientUrl: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Target Keyword</label>
                  <Input
                    placeholder="e.g., best running shoes"
                    value={formData.targetKeyword}
                    onChange={(e) => setFormData({ ...formData, targetKeyword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    placeholder="Optional project description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Competitor Websites</label>
                <Textarea
                  placeholder="Enter one URL per line (supports 40+ websites)&#10;https://competitor1.com&#10;https://competitor2.com&#10;https://competitor3.com"
                  value={formData.websites}
                  onChange={(e) => setFormData({ ...formData, websites: e.target.value })}
                  rows={6}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {formData.websites.split('\n').filter(url => url.trim().length > 0).length} websites added
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No projects yet. Create your first project to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/projects/${project.id}`}>
                      <CardTitle className="hover:text-blue-600 cursor-pointer">{project.name}</CardTitle>
                    </Link>
                    <CardDescription className="mt-1">{project.clientUrl}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                  )}
                  {project.targetKeyword && (
                    <p className="text-sm">
                      <span className="font-medium">Target:</span> {project.targetKeyword}
                    </p>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{project.websites.length}</span> websites
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
