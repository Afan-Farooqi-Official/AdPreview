import { FolderOpen, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from './ProjectCard';
import { Skeleton } from '../shared/Skeleton';
import { Button } from '../shared/Button';
import type { Project } from '../../types';

interface ProjectGridProps {
  projects: Project[];
  loading: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectGrid({ projects, loading, onOpen, onDelete }: ProjectGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[hsl(var(--color-surface-alt2))] rounded-2xl flex items-center justify-center mb-4">
          <FolderOpen size={28} className="text-[hsl(var(--color-text-subtle))]" />
        </div>
        <h3 className="text-lg font-semibold text-[hsl(var(--color-text))] mb-1">
          No projects yet
        </h3>
        <p className="text-sm text-[hsl(var(--color-text-muted))] mb-6 max-w-xs">
          You haven't created any billboard previews yet. Start by uploading your first ad.
        </p>
        <Button onClick={() => navigate('/editor')} id="empty-projects-cta">
          <Plus size={16} />
          Create your first project
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          onOpen={() => onOpen(p.id)}
          onDelete={() => onDelete(p.id)}
        />
      ))}
    </div>
  );
}
