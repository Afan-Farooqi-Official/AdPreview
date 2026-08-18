import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ProjectGrid } from '../components/projects/ProjectGrid';
import { DeleteConfirmDialog } from '../components/projects/DeleteConfirmDialog';
import { Button } from '../components/shared/Button';
import { useToast } from '../components/shared/Toast';
import { useAuth } from '../hooks/useAuth';
import { projectsService } from '../services/projects';
import type { Project } from '../types';

export function ProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await projectsService.getProjects(user.id);
      setProjects(data);
    } catch {
      toast('error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleOpen = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error } = await projectsService.deleteProject(deleteTarget.id);
    setDeleteLoading(false);

    if (error) {
      toast('error', `Delete failed: ${error}`);
    } else {
      toast('success', 'Project deleted.');
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--color-text))]">
              My Projects
            </h1>
            <p className="text-sm text-[hsl(var(--color-text-muted))] mt-1">
              {loading ? '…' : `${projects.length} saved project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button onClick={() => navigate('/editor')} id="new-project-btn">
            <Plus size={16} />
            New Project
          </Button>
        </div>

        <ProjectGrid
          projects={projects}
          loading={loading}
          onOpen={handleOpen}
          onDelete={(id) => {
            const proj = projects.find((p) => p.id === id);
            if (proj) setDeleteTarget(proj);
          }}
        />
      </main>
      <Footer />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        projectName={deleteTarget?.name}
      />
    </div>
  );
}
