import { Lock } from 'lucide-react';
import type { Scene } from '../../types';
import { clsx } from 'clsx';

interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}

export function SceneCard({ scene, isSelected, isLocked, onSelect }: SceneCardProps) {
  return (
    <button
      id={`scene-card-${scene.id}`}
      onClick={onSelect}
      className={clsx(
        'relative w-full rounded-[var(--radius)] overflow-hidden border-2 transition-all duration-150 group focus-ring text-left',
        isSelected
          ? 'border-[hsl(var(--color-brand))] shadow-md'
          : 'border-transparent hover:border-[hsl(var(--color-brand))]/40',
        isLocked && !isSelected && 'opacity-75'
      )}
    >
      <div className="aspect-video bg-[hsl(var(--color-surface-alt2))] relative overflow-hidden">
        <img
          src={scene.previewImageUrl}
          alt={scene.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
          }}
        />
        {/* Fallback placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--color-text-subtle))] text-xs pointer-events-none">
          <span className="bg-[hsl(var(--color-surface-alt))]/80 px-2 py-0.5 rounded">
            {scene.name}
          </span>
        </div>
        {isLocked && (
          <div className="absolute inset-0 bg-[hsl(var(--color-text))]/40 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-1.5">
              <Lock size={14} className="text-[hsl(var(--color-text))]" />
            </div>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[hsl(var(--color-brand))] rounded-full border-2 border-white" />
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="text-xs font-medium text-[hsl(var(--color-text))] truncate">{scene.name}</p>
        {isLocked && (
          <p className="text-[10px] text-[hsl(var(--color-pro))] font-semibold">Pro</p>
        )}
      </div>
    </button>
  );
}
