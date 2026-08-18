import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  CheckCircle2,
  Edit2,
  RotateCcw,
  RotateCw,
  Download as DownloadIcon,
  Play,
  Search,
  Monitor,
  Package,
  Car,
  Store,
  ShoppingBag,
  Shirt,
  Wine,
  Tv,
  MoreHorizontal,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { EditorCanvas, type EditorCanvasHandle } from '../components/editor/EditorCanvas';
import { TransformControls } from '../components/editor/TransformControls';
import { SceneGallery } from '../components/editor/SceneGallery';
import { UpgradeModal } from '../components/editor/UpgradeModal';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../components/shared/Toast';
import { scenesService } from '../services/scenes';
import { projectsService } from '../services/projects';
import type { Scene, Transform } from '../types';

const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  scale: 1,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skewX: 0,
  skewY: 0,
  opacity: 1,
  keepRatio: false,
  textLayers: [],
};

const surfaceCategories = [
  { id: 'billboards', name: 'Billboards', icon: Monitor, active: true },
  { id: 'products', name: 'Products', icon: Package, active: false },
  { id: 'vehicles', name: 'Vehicles', icon: Car, active: false },
  { id: 'storefronts', name: 'Storefronts', icon: Store, active: false },
  { id: 'packaging', name: 'Packaging', icon: ShoppingBag, active: false },
  { id: 'clothing', name: 'Clothing', icon: Shirt, active: false },
  { id: 'bottles', name: 'Bottles & Cans', icon: Wine, active: false },
  { id: 'screens', name: 'Digital Screens', icon: Tv, active: false },
  { id: 'more', name: 'More', icon: MoreHorizontal, active: false },
];

const SAMPLE_AD_URL = '/mock/ads/sample-sneaker.png';

export function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const isSampleMode = searchParams.get('sample') === 'true';
  const paramAdUrl = searchParams.get('adUrl') ?? searchParams.get('ad');

  const { user } = useAuth();
  const { isPro, plan } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canvasRef = useRef<EditorCanvasHandle>(null);

  const [adImageUrl, setAdImageUrl] = useState<string | null>(
    paramAdUrl || (isSampleMode ? SAMPLE_AD_URL : null)
  );
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState('default');
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('New Mockup');
  const [isEditingName, setIsEditingName] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('All changes saved');

  // Load existing project if editing saved project
  useEffect(() => {
    if (!projectId) return;
    projectsService.getProject(projectId).then(async (proj) => {
      if (!proj) return;
      setAdImageUrl(proj.adImageUrl);
      setTransform(proj.transform);
      setProjectName(proj.name);
      const scene = await scenesService.getScene(proj.sceneId);
      if (scene) setSelectedScene(scene);
    });
  }, [projectId]);

  // Default to first billboard scene
  useEffect(() => {
    if (selectedScene) return;
    scenesService.getScenes().then((scenes) => {
      const firstFree = scenes.find((s) => !s.isProOnly) ?? scenes[0];
      if (firstFree) setSelectedScene(firstFree);
    });
  }, []);

  const openUpgradeModal = useCallback((trigger = 'default') => {
    setUpgradeTrigger(trigger);
    setUpgradeModalOpen(true);
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!user) {
      navigate('/signup?redirectTo=/editor');
      return;
    }
    const { url, error } = await projectsService.uploadAdImage(user.id, file);
    if (error) {
      toast('error', `Upload failed: ${error}`);
      return;
    }
    setAdImageUrl(url);
    setTransform(DEFAULT_TRANSFORM);
    setLastSavedText('Saved just now');
    toast('success', 'Design uploaded successfully!');
  };

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setTransform({
      x: scene.defaultBoundingBox.x,
      y: scene.defaultBoundingBox.y,
      scale: 1,
      rotation: scene.defaultBoundingBox.rotation,
    });
  };

  const handleReset = () => {
    if (!selectedScene) return;
    setTransform({
      x: selectedScene.defaultBoundingBox.x,
      y: selectedScene.defaultBoundingBox.y,
      scale: 1,
      rotation: selectedScene.defaultBoundingBox.rotation,
    });
    toast('info', 'Reset position to billboard center.');
  };

  const handleSaveProject = async () => {
    if (!user) {
      navigate('/signup?redirectTo=/editor');
      return;
    }
    if (!selectedScene || !adImageUrl) {
      toast('info', 'Please upload a design and select a scene first.');
      return;
    }

    setSaving(true);
    const thumbnail = canvasRef.current?.exportImage(false) ?? null;

    const { error } = await projectsService.saveProject(
      {
        userId: user.id,
        name: projectName || 'Untitled Mockup',
        sceneId: selectedScene.id,
        adImageUrl,
        transform,
        resultThumbnailUrl: thumbnail,
      },
      plan
    );
    setSaving(false);

    if (error === 'FREE_LIMIT_REACHED') {
      openUpgradeModal('project_limit');
    } else if (error) {
      toast('error', `Save failed: ${error}`);
    } else {
      setLastSavedText('Saved just now');
      toast('success', 'Project saved to My Projects.');
    }
  };

  const handleDownload = (hd: boolean) => {
    if (hd && !isPro) {
      openUpgradeModal('hd_export');
      return;
    }
    const dataUrl = canvasRef.current?.exportImage(hd);
    if (!dataUrl) {
      toast('error', 'Export failed. Please try again.');
      return;
    }
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `adviz-${projectName.toLowerCase().replace(/\s+/g, '-')}-${hd ? 'hd' : 'standard'}.jpg`;
    a.click();
    toast('success', `Exported ${hd ? 'HD' : 'standard'} mockup!`);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans">
      {/* 1. Top Bar */}
      <header className="h-[60px] bg-white border-b border-[hsl(var(--color-border))] px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Logo & Project Name */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-black text-lg text-slate-900 tracking-tight">
            <div className="w-7 h-7 bg-gradient-to-tr from-[hsl(var(--color-brand-dark))] to-[hsl(var(--color-brand))] rounded-lg flex items-center justify-center text-white text-sm font-black shadow-sm">
              A
            </div>
            <span>AdPreview</span>
          </Link>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Project Title & Status */}
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                  className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded outline-none border border-indigo-400"
                />
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <span className="text-sm font-bold text-slate-900">{projectName}</span>
                  <Edit2 size={12} className="text-slate-400 group-hover:text-slate-700" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{lastSavedText}</span>
              <CheckCircle2 size={11} className="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Right: How it works, Undo/Redo, Download */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => toast('info', 'Drag your design over the billboard to position, resize with corners, and click Download.')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            <Play size={13} className="text-indigo-600 fill-indigo-600" />
            How it works
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Undo / Reset"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleReset}
              title="Redo"
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {user && (
            <button
              onClick={handleSaveProject}
              disabled={saving || !adImageUrl}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}

          <button
            onClick={() => handleDownload(isPro)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--color-brand))] hover:bg-[hsl(var(--color-brand-dark))] text-white text-xs font-bold shadow-md shadow-[hsl(var(--color-brand))]/25 transition-all"
          >
            <DownloadIcon size={14} />
            Download
          </button>
        </div>
      </header>

      {/* 2. Stepper Bar */}
      <div className="h-[48px] bg-white border-b border-[hsl(var(--color-border))] px-6 hidden md:flex items-center justify-center shrink-0">
        <div className="flex items-center gap-8 max-w-4xl text-xs">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[hsl(var(--color-brand))] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-slate-900">Upload Ad</span>
              <span className="text-slate-400 ml-1.5 hidden lg:inline">Add your design</span>
            </div>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[hsl(var(--color-brand))] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-slate-900">Choose Surface</span>
              <span className="text-slate-400 ml-1.5 hidden lg:inline">Select where to place</span>
            </div>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 3 (Active) */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[hsl(var(--color-brand))] text-white flex items-center justify-center text-[10px] font-bold shadow-sm shadow-[hsl(var(--color-brand))]/40">
              3
            </div>
            <div>
              <span className="font-bold text-[hsl(var(--color-brand))]">Place Your Ad</span>
              <span className="text-slate-400 ml-1.5 hidden lg:inline">Drag and position</span>
            </div>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 4 */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold">
              4
            </div>
            <div>
              <span className="font-bold text-slate-400">Preview &amp; Download</span>
              <span className="text-slate-400 ml-1.5 hidden lg:inline">Save your mockup</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Editor Body (3-Column Layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Surface Categories & Upload */}
        <aside className="w-64 bg-white border-r border-[hsl(var(--color-border))] flex flex-col shrink-0 overflow-y-auto hidden lg:flex">
          {/* Upload Button */}
          <div className="p-4 pb-2">
            <label
              htmlFor="left-upload-input"
              className="flex flex-col items-center justify-center w-full py-3 px-4 rounded-xl bg-[hsl(var(--color-brand))] hover:bg-[hsl(var(--color-brand-dark))] text-white font-bold text-xs shadow-md shadow-[hsl(var(--color-brand))]/20 cursor-pointer transition-all gap-0.5 text-center"
            >
              <div className="flex items-center gap-1.5">
                <UploadCloud size={16} />
                <span>Upload Your Ad</span>
              </div>
              <span className="text-[10px] font-normal opacity-85">
                JPG, PNG, WebP up to 25MB
              </span>
              <input
                id="left-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </label>
          </div>

          {/* Surface Category Section */}
          <div className="p-4 pt-2 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">1. Choose a Surface</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search surfaces..."
                className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category List */}
            <div className="space-y-0.5">
              {surfaceCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (!cat.active) {
                        toast('info', `${cat.name} will be available in future updates. Billboard surfaces are active!`);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      cat.active
                        ? 'bg-[hsl(var(--color-brand-light))] text-[hsl(var(--color-brand))] font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} />
                      <span>{cat.name}</span>
                    </div>
                    <ChevronRight size={13} className={cat.active ? 'text-indigo-600' : 'text-slate-300'} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom AI Promo Box */}
          <div className="p-4 border-t border-[hsl(var(--color-border))]">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-900 mb-1">
                <span>Make it realistic in one click</span>
                <Sparkles size={11} className="text-amber-500" />
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed mb-2">
                Our engine automatically aligns perspective and shadows for your billboard.
              </p>
              <div className="rounded-lg overflow-hidden aspect-video bg-slate-900">
                <img
                  src="/mock/scenes/city-night-thumb.jpg"
                  alt="Realistic preview mockup"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Canvas & Bottom Gallery */}
        <main className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <EditorCanvas
              ref={canvasRef}
              scene={selectedScene}
              adImageUrl={adImageUrl}
              transform={transform}
              onTransformChange={setTransform}
              selectedTextId={selectedTextId}
              onSelectText={setSelectedTextId}
              onReplaceSurface={() => {
                toast('info', 'Choose any billboard from the bottom gallery to switch scenes.');
              }}
              isPro={isPro}
            />
          </div>

          {/* Bottom Billboard Gallery */}
          <SceneGallery
            selectedSceneId={selectedScene?.id ?? null}
            onSceneSelect={handleSceneSelect}
            onUpgradeNeeded={() => openUpgradeModal('scene_locked')}
          />
        </main>

        {/* Right Sidebar: Adjustments & Controls */}
        <aside className="w-80 bg-white border-l border-[hsl(var(--color-border))] flex flex-col shrink-0">
          <TransformControls
            transform={transform}
            onTransformChange={setTransform}
            onReset={handleReset}
            adImageUrl={adImageUrl}
            selectedTextId={selectedTextId}
            onSelectText={setSelectedTextId}
            onDeleteImage={() => setAdImageUrl(null)}
            onReplaceImage={handleFileUpload}
            disabled={!adImageUrl || !selectedScene}
          />
        </aside>
      </div>

      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        trigger={upgradeTrigger}
      />
    </div>
  );
}
