import { useState } from 'react';
import {
  Trash2,
  UploadCloud,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Dot,
  Sparkles,
  Type,
  Sliders,
  Lock,
  Unlock,
  Plus,
} from 'lucide-react';
import type { Transform, TextLayer } from '../../types';
import { Button } from '../shared/Button';

interface TransformControlsProps {
  transform: Transform;
  onTransformChange: (t: Transform) => void;
  onReset: () => void;
  onReplaceImage?: (file: File) => void;
  onDeleteImage?: () => void;
  adImageUrl?: string | null;
  selectedTextId?: string | null;
  onSelectText?: (id: string | null) => void;
  disabled?: boolean;
}

export function TransformControls({
  transform,
  onTransformChange,
  onReset,
  onReplaceImage,
  onDeleteImage,
  adImageUrl,
  selectedTextId,
  onSelectText,
  disabled,
}: TransformControlsProps) {
  const [activeTab, setActiveTab] = useState<'transform' | 'text'>('transform');

  const update = (patch: Partial<Transform>) =>
    onTransformChange({ ...transform, ...patch });

  const move = (dx: number, dy: number) => {
    onTransformChange({
      ...transform,
      x: transform.x + dx,
      y: transform.y + dy,
    });
  };

  // Text layer actions
  const addTextLayer = (sampleText: string, fontSize = 28) => {
    const newLayer: TextLayer = {
      id: `text_${Date.now()}`,
      text: sampleText,
      fontSize,
      fill: '#ffffff',
      fontStyle: 'bold',
      x: (transform.x || 280) + 40,
      y: (transform.y || 140) + ((transform.textLayers?.length || 0) * 35),
    };
    const updated = [...(transform.textLayers || []), newLayer];
    onTransformChange({ ...transform, textLayers: updated });
    onSelectText?.(newLayer.id);
  };

  const updateSelectedText = (patch: Partial<TextLayer>) => {
    if (!selectedTextId) return;
    const updated = (transform.textLayers || []).map((tl) =>
      tl.id === selectedTextId ? { ...tl, ...patch } : tl
    );
    onTransformChange({ ...transform, textLayers: updated });
  };

  const deleteSelectedText = () => {
    if (!selectedTextId) return;
    const updated = (transform.textLayers || []).filter(
      (tl) => tl.id !== selectedTextId
    );
    onTransformChange({ ...transform, textLayers: updated });
    onSelectText?.(null);
  };

  const currentTextLayer = (transform.textLayers || []).find(
    (tl) => tl.id === selectedTextId
  );

  return (
    <div className="flex flex-col h-full bg-white text-left select-none">
      {/* Tab Switcher */}
      <div className="flex border-b border-[hsl(var(--color-border))] shrink-0">
        <button
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'transform'
              ? 'border-[hsl(var(--color-brand))] text-[hsl(var(--color-brand))] bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders size={14} />
          Stretch &amp; Position
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'text'
              ? 'border-[hsl(var(--color-brand))] text-[hsl(var(--color-brand))] bg-indigo-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Type size={14} />
          Titles &amp; Text ({(transform.textLayers || []).length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {activeTab === 'transform' ? (
          <>
            {/* Your Design Card */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900">Your Design</span>
                {adImageUrl && onDeleteImage && (
                  <button
                    onClick={onDeleteImage}
                    title="Remove design"
                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-100"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {adImageUrl ? (
                <div className="card overflow-hidden border border-slate-200 rounded-xl bg-slate-50 p-1 mb-2 shadow-sm">
                  <div className="aspect-[2.2/1] bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={adImageUrl}
                      alt="Your design preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 mb-2">
                  No design selected
                </div>
              )}

              <label
                htmlFor="replace-ad-file-btn"
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[hsl(var(--color-brand-light))] text-[hsl(var(--color-brand))] hover:bg-indigo-100 transition-colors text-xs font-bold cursor-pointer"
              >
                <UploadCloud size={15} />
                Replace Design
                <input
                  id="replace-ad-file-btn"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onReplaceImage) onReplaceImage(file);
                  }}
                />
              </label>
            </div>

            {/* Corner Stretch & Scale */}
            <div className="border-t border-slate-200 pt-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Corner &amp; Edge Stretch</span>
                <button
                  onClick={() => update({ keepRatio: !transform.keepRatio })}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--color-brand))] hover:underline"
                >
                  {transform.keepRatio ? (
                    <>
                      <Lock size={12} /> Proportional
                    </>
                  ) : (
                    <>
                      <Unlock size={12} /> Free Stretch
                    </>
                  )}
                </button>
              </div>

              {/* Width Stretch Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">↔ Width Stretch</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round((transform.scaleX || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.01"
                  value={transform.scaleX || 1}
                  disabled={disabled}
                  onChange={(e) => update({ scaleX: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Height Stretch Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">↕ Height Stretch</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round((transform.scaleY || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.01"
                  value={transform.scaleY || 1}
                  disabled={disabled}
                  onChange={(e) => update({ scaleY: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Overall Scale Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">🔍 Overall Scale</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round((transform.scale || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.01"
                  value={transform.scale || 1}
                  disabled={disabled}
                  onChange={(e) => update({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Tilt, Skew & Angle */}
            <div className="border-t border-slate-200 pt-4 space-y-3.5">
              <span className="text-xs font-bold text-slate-900">Tilt &amp; Billboard Angle</span>

              {/* Horizontal Skew / Tilt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">⧄ Horizontal Tilt (Skew X)</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round(transform.skewX || 0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={transform.skewX || 0}
                  disabled={disabled}
                  onChange={(e) => update({ skewX: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Vertical Skew / Tilt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">⧅ Vertical Tilt (Skew Y)</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round(transform.skewY || 0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={transform.skewY || 0}
                  disabled={disabled}
                  onChange={(e) => update({ skewY: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">⟳ Rotation</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round(transform.rotation || 0)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={transform.rotation || 0}
                  disabled={disabled}
                  onChange={(e) => update({ rotation: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Z-Axis / Depth */}
            <div className="border-t border-slate-200 pt-4 space-y-3.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-indigo-100 text-indigo-700 font-extrabold text-[9px]">Z</span>
                Depth &amp; Shadow
              </span>

              {/* Depth Z — perspective push/pull */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">⬚ Z-Depth (Near ↔ Far)</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {transform.depthZ || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={transform.depthZ || 0}
                  disabled={disabled}
                  onChange={(e) => update({ depthZ: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>← Closer</span><span>Farther →</span>
                </div>
              </div>

              {/* Shadow Depth — drop shadow elevation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">◫ Shadow Elevation</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {transform.shadowDepth || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={transform.shadowDepth || 0}
                  disabled={disabled}
                  onChange={(e) => update({ shadowDepth: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>Flat</span><span>Deep shadow</span>
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">◑ Opacity</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {Math.round((transform.opacity ?? 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.01"
                  value={transform.opacity ?? 1}
                  disabled={disabled}
                  onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-[hsl(var(--color-brand))] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              {/* Layer Order — text above/below image */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-slate-500 font-medium">Text layer order</span>
                <button
                  onClick={() => update({ textBelowImage: !transform.textBelowImage })}
                  disabled={disabled}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    transform.textBelowImage
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {transform.textBelowImage ? '▤ Text Below' : '▣ Text Above'}
                </button>
              </div>
            </div>

            {/* Position D-Pad Controller */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <span className="text-xs font-bold text-slate-900">Position Nudge</span>

              <div className="flex justify-center items-center">
                <div className="grid grid-cols-3 gap-1 w-28 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <div />
                  <button
                    onClick={() => move(0, -10)}
                    disabled={disabled}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-40"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <div />

                  <button
                    onClick={() => move(-10, 0)}
                    disabled={disabled}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={onReset}
                    title="Center / Reset"
                    disabled={disabled}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-40"
                  >
                    <Dot size={20} />
                  </button>
                  <button
                    onClick={() => move(10, 0)}
                    disabled={disabled}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div />
                  <button
                    onClick={() => move(0, 10)}
                    disabled={disabled}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:text-indigo-600 transition-colors disabled:opacity-40"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <div />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Titles & Text Overlays Panel */
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-900">Add Text / Title Overlays</span>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addTextLayer('HEADLINE TITLE', 36)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold text-slate-800 transition-colors"
              >
                <Plus size={13} className="text-indigo-600" />
                + Headline
              </button>
              <button
                onClick={() => addTextLayer('Subheadline text here', 22)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold text-slate-800 transition-colors"
              >
                <Plus size={13} className="text-indigo-600" />
                + Subtitle
              </button>
              <button
                onClick={() => addTextLayer('SHOP NOW →', 20)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold text-slate-800 transition-colors"
              >
                <Plus size={13} className="text-indigo-600" />
                + CTA Button
              </button>
              <button
                onClick={() => addTextLayer('50% OFF TODAY', 28)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-xs font-bold text-slate-800 transition-colors"
              >
                <Plus size={13} className="text-indigo-600" />
                + Badge Text
              </button>
            </div>

            {/* Active Selected Text Inspector */}
            {currentTextLayer ? (
              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950">Edit Selected Text</span>
                  <button
                    onClick={deleteSelectedText}
                    title="Delete text layer"
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Text String Input */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={currentTextLayer.text}
                    onChange={(e) => updateSelectedText({ text: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>Font Size</span>
                    <span className="font-bold tabular-nums">{currentTextLayer.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="72"
                    step="1"
                    value={currentTextLayer.fontSize}
                    onChange={(e) =>
                      updateSelectedText({ fontSize: parseInt(e.target.value) })
                    }
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* Text Color Picker */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Color</span>
                  <div className="flex items-center gap-1.5">
                    {['#ffffff', '#000000', '#f59e0b', '#ef4444', '#10b981', '#6366f1'].map(
                      (c) => (
                        <button
                          key={c}
                          onClick={() => updateSelectedText({ fill: c })}
                          className={`w-5 h-5 rounded-full border border-slate-300 transition-transform ${
                            currentTextLayer.fill === c ? 'scale-125 ring-2 ring-indigo-500' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Font Style */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateSelectedText({
                        fontStyle: currentTextLayer.fontStyle === 'bold' ? 'normal' : 'bold',
                      })
                    }
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold border transition-colors ${
                      currentTextLayer.fontStyle === 'bold'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    Bold
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                Click on any text on the canvas to customize its font, size, or color.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auto Fit Button */}
      <div className="p-4 border-t border-slate-200 shrink-0 bg-white">
        <Button
          size="md"
          className="w-full font-bold shadow-md shadow-indigo-500/20 rounded-xl gap-2 text-xs"
          onClick={onReset}
        >
          <Sparkles size={15} />
          Auto-Fit &amp; Center
        </Button>
      </div>
    </div>
  );
}
