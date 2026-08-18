import { Calendar, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectCardProps {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  return (
    <div className="card card-lift group overflow-hidden cursor-pointer" onClick={onOpen}>
      {/* Thumbnail */}
      <div className="aspect-video bg-[hsl(var(--color-surface-alt2))] relative overflow-hidden">
        {project.resultThumbnailUrl ? (
          <img
            src={project.resultThumbnailUrl}
            alt={`Preview for ${project.name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <ImageIcon size={28} className="text-[hsl(var(--color-text-subtle))]" />
            <span className="text-xs text-[hsl(var(--color-text-subtle))]">No preview</span>
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`open-project-${project.id}`}
            title="Open in editor"
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="w-7 h-7 bg-white/90 rounded-md flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <ExternalLink size={13} className="text-[hsl(var(--color-text))]" />
          </button>
          <button
            id={`delete-project-${project.id}`}
            title="Delete project"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 bg-white/90 rounded-md flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 size={13} className="text-[hsl(var(--color-error))]" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-[hsl(var(--color-text))] truncate mb-1">
          {project.name}
        </p>
        <div className="flex items-center gap-1 text-xs text-[hsl(var(--color-text-subtle))]">
          <Calendar size={11} />
          {formatDate(project.updatedAt)}
        </div>
      </div>
    </div>
  );
}
