'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface Website {
  id: string;
  url: string;
  type: string;
  notes?: string;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  targetKeyword?: string;
  clientUrl: string;
  status: string;
  websites: Website[];
  createdAt: string;
}

interface ProjectDetailsProps {
  projectId: string;
}

export function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingWebsite, setAddingWebsite] = useState(false);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      setProject(data.project);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebsiteUrl.trim()) return;

    setAddingWebsite(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/websites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newWebsiteUrl.trim(),
          type: 'competitor'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add website');
      }

      const data = await res.json();
      if (project) {
        setProject({
          ...project,
          websites: [data.website, ...project.websites]
        });
      }
      setNewWebsiteUrl('');
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding website:', err);
    } finally {
      setAddingWebsite(false);
    }
  };

  const handleDeleteWebsite = async (websiteId: string) => {
    if (!window.confirm('Remove this website from the project?')) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/websites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId })
      });

      if (!res.ok) throw new Error('Failed to delete website');

      if (project) {
        setProject({
          ...project,
          websites: project.websites.filter(w => w.id !== websiteId)
        });
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting website:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-300 mb-4" />
        <p className="text-red-600">Project not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{project.name}</CardTitle>
              <CardDescription className="mt-2">{project.description}</CardDescription>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Client URL</p>
              <p className="font-mono text-sm break-all">{project.clientUrl}</p>
            </div>
            {project.targetKeyword && (
              <div>
                <p className="text-sm text-gray-600">Target Keyword</p>
                <p className="font-medium">{project.targetKeyword}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Websites</p>
              <p className="text-2xl font-bold text-blue-600">{project.websites.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Website Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Website</CardTitle>
          <CardDescription>Add competitor or reference websites to this project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddWebsite} className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={newWebsiteUrl}
              onChange={(e) => setNewWebsiteUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={addingWebsite} className="gap-2">
              {addingWebsite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Websites List */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Websites ({project.websites.length})</CardTitle>
          <CardDescription>All websites associated with this project</CardDescription>
        </CardHeader>
        <CardContent>
          {project.websites.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No websites added yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {project.websites.map((website) => (
                <div
                  key={website.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-sm break-all">{website.url}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(website.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWebsite(website.id)}
                    className="text-red-600 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
