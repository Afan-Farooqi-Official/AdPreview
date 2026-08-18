import { useState, useEffect } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { scenesService } from '../../services/scenes';
import { useSubscription } from '../../hooks/useSubscription';
import type { Scene } from '../../types';

interface SceneGalleryProps {
  selectedSceneId: string | null;
  onSceneSelect: (scene: Scene) => void;
  onUpgradeNeeded: () => void;
}

export function SceneGallery({ selectedSceneId, onSceneSelect, onUpgradeNeeded }: SceneGalleryProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPro } = useSubscription();

  useEffect(() => {
    scenesService
      .getScenes()
      .then(setScenes)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (scene: Scene) => {
    if (scene.isProOnly && !isPro) {
      onUpgradeNeeded();
      return;
    }
    onSceneSelect(scene);
  };

  return (
    <div className="w-full bg-white border-t border-[hsl(var(--color-border))] px-6 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[hsl(var(--color-text))]">
            Popular Billboard Surfaces
          </span>
          <span className="text-[10px] text-[hsl(var(--color-text-muted))]">
            ({scenes.length} available)
          </span>
        </div>
        <button
          onClick={onUpgradeNeeded}
          className="text-xs font-semibold text-[hsl(var(--color-brand))] hover:underline flex items-center gap-1"
        >
          <span>View all</span>
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-32 aspect-video bg-slate-100 rounded-xl animate-pulse shrink-0"
              />
            ))
          : scenes.map((scene) => {
              const isSelected = scene.id === selectedSceneId;
              const isLocked = scene.isProOnly && !isPro;

              return (
                <button
                  key={scene.id}
                  onClick={() => handleSelect(scene)}
                  className={`group relative w-32 aspect-video rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-150 text-left focus:outline-none ${
                    isSelected
                      ? 'border-[hsl(var(--color-brand))] ring-2 ring-[hsl(var(--color-brand))]/30 shadow-md scale-105'
                      : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-brand))]/50'
                  }`}
                >
                  <img
                    src={scene.previewImageUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-[hsl(var(--color-brand))] rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                      ✓
                    </div>
                  )}
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-800 shadow-sm">
                        <Lock size={12} />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-3">
                    <p className="text-[10px] font-bold text-white truncate">{scene.name}</p>
                  </div>
                </button>
              );
            })}
      </div>
    </div>
  );
}
