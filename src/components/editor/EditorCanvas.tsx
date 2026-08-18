import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Text, Group } from 'react-konva';
import type Konva from 'konva';
import { Hand, ZoomIn, ZoomOut, Maximize2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import type { Scene, Transform, TextLayer } from '../../types';
import { ENABLE_WATERMARK, STANDARD_EXPORT_MAX_PX } from '../../types';

interface EditorCanvasProps {
  scene: Scene | null;
  adImageUrl: string | null;
  transform: Transform;
  onTransformChange: (t: Transform) => void;
  onReplaceSurface?: () => void;
  selectedTextId?: string | null;
  onSelectText?: (id: string | null) => void;
  isPro: boolean;
}

export interface EditorCanvasHandle {
  exportImage: (hd: boolean) => string | null;
}

const CANVAS_W = 860;
const CANVAS_H = 500;

function useImage(url: string | null): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImg(null);
      return;
    }
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.src = url;
    i.onload = () => setImg(i);
    i.onerror = () => setImg(null);
    return () => {
      i.onload = null;
      i.onerror = null;
    };
  }, [url]);
  return img;
}

export const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(
  (
    {
      scene,
      adImageUrl,
      transform,
      onTransformChange,
      onReplaceSurface,
      selectedTextId,
      onSelectText,
      isPro,
    },
    ref
  ) => {
    const stageRef = useRef<Konva.Stage>(null);
    const adNodeRef = useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const textTrRef = useRef<Konva.Transformer>(null);
    const textNodesRef = useRef<Map<string, Konva.Text>>(new Map());

    const [selected, setSelected] = useState(true);
    const [zoom, setZoom] = useState(1);

    const sceneImg = useImage(scene?.sourceImageUrl ?? null);
    const adImg = useImage(adImageUrl);

    // Attach transformer to image node
    useEffect(() => {
      if (selected && !selectedTextId && trRef.current && adNodeRef.current && adImg) {
        trRef.current.nodes([adNodeRef.current]);
        trRef.current.getLayer()?.batchDraw();
      } else if (trRef.current && (!selected || selectedTextId)) {
        trRef.current.nodes([]);
        trRef.current.getLayer()?.batchDraw();
      }
    }, [selected, selectedTextId, adImg, scene]);

    // Attach transformer to selected text node
    useEffect(() => {
      if (selectedTextId && textTrRef.current) {
        const textNode = textNodesRef.current.get(selectedTextId);
        if (textNode) {
          textTrRef.current.nodes([textNode]);
          textTrRef.current.getLayer()?.batchDraw();
        }
      } else if (textTrRef.current) {
        textTrRef.current.nodes([]);
        textTrRef.current.getLayer()?.batchDraw();
      }
    }, [selectedTextId, transform.textLayers]);

    // Expose export function to parent
    useImperativeHandle(ref, () => ({
      exportImage: (hd: boolean) => {
        if (!stageRef.current) return null;

        // Deselect transformers before export
        setSelected(false);
        if (trRef.current) trRef.current.nodes([]);
        if (textTrRef.current) textTrRef.current.nodes([]);

        const stage = stageRef.current;
        const pixelRatio = hd
          ? Math.min((scene ? 1920 / CANVAS_W : 1), 3)
          : Math.min(STANDARD_EXPORT_MAX_PX / CANVAS_W, 1);

        return stage.toDataURL({ pixelRatio, mimeType: 'image/jpeg', quality: 0.94 });
      },
    }));

    const handleAdDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      onTransformChange({
        ...transform,
        x: e.target.x(),
        y: e.target.y(),
      });
    };

    const handleAdTransformEnd = () => {
      const node = adNodeRef.current;
      if (!node) return;
      const curScaleX = node.scaleX();
      const curScaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onTransformChange({
        ...transform,
        x: node.x(),
        y: node.y(),
        scaleX: (transform.scaleX || 1) * curScaleX,
        scaleY: (transform.scaleY || 1) * curScaleY,
        rotation: node.rotation(),
      });
    };

    const handleTextDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const updatedLayers = (transform.textLayers || []).map((tl) =>
        tl.id === id ? { ...tl, x: e.target.x(), y: e.target.y() } : tl
      );
      onTransformChange({
        ...transform,
        textLayers: updatedLayers,
      });
    };

    // Calculate ad placement
    const bb = scene?.defaultBoundingBox;
    const adX = transform.x !== 0 || transform.y !== 0 ? transform.x : (bb?.x ?? 280);
    const adY = transform.x !== 0 || transform.y !== 0 ? transform.y : (bb?.y ?? 120);

    const baseWidth = bb?.width ?? 480;
    const baseHeight = bb?.height ?? 260;

    const adWidth = baseWidth * (transform.scaleX || 1) * (transform.scale || 1);
    const adHeight = adImg
      ? (baseHeight || (baseWidth / adImg.width) * adImg.height) *
        (transform.scaleY || 1) *
        (transform.scale || 1)
      : baseHeight * (transform.scaleY || 1);

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/95 overflow-hidden p-6 select-none">
        {/* Top Floating Actions */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          <button
            onClick={onReplaceSurface}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-xs font-bold text-slate-800 hover:bg-white transition-all hover:scale-105"
          >
            <RefreshCw size={13} className="text-indigo-600" />
            Replace Surface
          </button>
          <button
            onClick={onReplaceSurface}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-xs font-bold text-slate-800 hover:bg-white transition-all hover:scale-105"
          >
            <ImageIcon size={13} className="text-indigo-600" />
            Change Environment
          </button>
        </div>

        {/* Stage Wrapper */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center"
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelected(false);
              onSelectText?.(null);
            }
          }}
        >
          <Stage
            ref={stageRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ cursor: selected ? 'move' : 'default' }}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                setSelected(false);
                onSelectText?.(null);
              }
            }}
          >
            {/* Background Layer — Scene Image */}
            <Layer>
              {sceneImg ? (
                <KonvaImage
                  image={sceneImg}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  listening={false}
                />
              ) : (
                <>
                  <Rect width={CANVAS_W} height={CANVAS_H} fill="#0f172a" />
                  <Text
                    text={scene ? 'Loading scene…' : 'Select a billboard scene'}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    align="center"
                    verticalAlign="middle"
                    fill="#94a3b8"
                    fontSize={16}
                    listening={false}
                  />
                </>
              )}
            </Layer>

            {/* Ad Layer */}
            <Layer>
              {/* If textBelowImage is true, render text layers behind image */}
              {transform.textBelowImage && transform.textLayers && transform.textLayers.length > 0 && (
                <Group>
                  {transform.textLayers.map((tl: TextLayer) => (
                    <Text
                      key={tl.id}
                      ref={(node) => {
                        if (node) textNodesRef.current.set(tl.id, node);
                        else textNodesRef.current.delete(tl.id);
                      }}
                      text={tl.text}
                      x={tl.x || adX + 20}
                      y={tl.y || adY + 20}
                      fontSize={tl.fontSize || 28}
                      fontFamily="Arial, sans-serif"
                      fontStyle={tl.fontStyle || 'bold'}
                      fill={tl.fill || '#ffffff'}
                      shadowColor="rgba(0,0,0,0.8)"
                      shadowBlur={4}
                      shadowOffset={{ x: 2, y: 2 }}
                      shadowOpacity={0.8}
                      draggable
                      onClick={() => {
                        setSelected(false);
                        onSelectText?.(tl.id);
                      }}
                      onTap={() => {
                        setSelected(false);
                        onSelectText?.(tl.id);
                      }}
                      onDragEnd={(e) => handleTextDragEnd(tl.id, e)}
                    />
                  ))}
                </Group>
              )}

              {adImg && (
                <>
                  <KonvaImage
                    ref={adNodeRef}
                    image={adImg}
                    x={adX}
                    y={adY}
                    width={adWidth}
                    height={adHeight}
                    rotation={transform.rotation || 0}
                    skewX={((transform.skewX || 0) + (transform.depthZ ? (transform.depthZ * 0.25) : 0)) * (Math.PI / 180)}
                    skewY={(transform.skewY || 0) * (Math.PI / 180)}
                    scaleX={1 + (transform.depthZ || 0) / 250}
                    scaleY={1 + (transform.depthZ || 0) / 350}
                    opacity={transform.opacity ?? 1}
                    shadowColor="rgba(0,0,0,0.85)"
                    shadowBlur={(transform.shadowDepth || 0) * 2.5}
                    shadowOffset={{
                      x: (transform.shadowDepth || 0) * 0.8,
                      y: (transform.shadowDepth || 0) * 1.4,
                    }}
                    shadowOpacity={(transform.shadowDepth || 0) > 0 ? 0.75 : 0}
                    draggable
                    onClick={() => {
                      setSelected(true);
                      onSelectText?.(null);
                    }}
                    onTap={() => {
                      setSelected(true);
                      onSelectText?.(null);
                    }}
                    onDragEnd={handleAdDragEnd}
                    onTransformEnd={handleAdTransformEnd}
                  />

                  {/* Corner & Side Stretch Transformer */}
                  <Transformer
                    ref={trRef}
                    rotateEnabled
                    keepRatio={transform.keepRatio ?? false}
                    borderStroke="#6366f1"
                    borderStrokeWidth={2}
                    borderDash={[4, 4]}
                    anchorStroke="#6366f1"
                    anchorFill="#ffffff"
                    anchorSize={11}
                    anchorCornerRadius={3}
                    rotateAnchorOffset={24}
                    enabledAnchors={[
                      'top-left',
                      'top-center',
                      'top-right',
                      'middle-right',
                      'middle-left',
                      'bottom-left',
                      'bottom-center',
                      'bottom-right',
                    ]}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 25 || newBox.height < 25) return oldBox;
                      return newBox;
                    }}
                  />
                </>
              )}

              {/* Text Overlays Layer */}
              {transform.textLayers && transform.textLayers.length > 0 && (
                <Group>
                  {transform.textLayers.map((tl: TextLayer) => (
                    <Text
                      key={tl.id}
                      ref={(node) => {
                        if (node) textNodesRef.current.set(tl.id, node);
                        else textNodesRef.current.delete(tl.id);
                      }}
                      text={tl.text}
                      x={tl.x || adX + 20}
                      y={tl.y || adY + 20}
                      fontSize={tl.fontSize || 28}
                      fontFamily="Arial, sans-serif"
                      fontStyle={tl.fontStyle || 'bold'}
                      fill={tl.fill || '#ffffff'}
                      shadowColor="rgba(0,0,0,0.8)"
                      shadowBlur={4}
                      shadowOffset={{ x: 2, y: 2 }}
                      shadowOpacity={0.8}
                      draggable
                      onClick={() => {
                        setSelected(false);
                        onSelectText?.(tl.id);
                      }}
                      onTap={() => {
                        setSelected(false);
                        onSelectText?.(tl.id);
                      }}
                      onDragEnd={(e) => handleTextDragEnd(tl.id, e)}
                    />
                  ))}
                  <Transformer
                    ref={textTrRef}
                    rotateEnabled
                    keepRatio
                    borderStroke="#f59e0b"
                    anchorStroke="#f59e0b"
                    anchorFill="#ffffff"
                    anchorSize={9}
                  />
                </Group>
              )}

              {/* Free User Watermark */}
              {ENABLE_WATERMARK && !isPro && (
                <Text
                  text="AdPreview — adpreview.app"
                  x={12}
                  y={CANVAS_H - 24}
                  fill="rgba(255,255,255,0.6)"
                  fontSize={12}
                  fontStyle="bold"
                  listening={false}
                />
              )}

              {!adImg && scene && (
                <Text
                  text="Upload your ad or choose a sample to place it on this billboard"
                  width={CANVAS_W}
                  height={CANVAS_H}
                  align="center"
                  verticalAlign="middle"
                  fill="rgba(255,255,255,0.65)"
                  fontSize={15}
                  fontStyle="bold"
                  listening={false}
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Bottom Floating Zoom & Pan Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200">
          <button
            title="Pan"
            className="p-1 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <Hand size={14} />
          </button>
          <div className="w-px h-3 bg-slate-300 mx-1" />
          <button
            title="Zoom Out"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-1 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-bold text-slate-800 min-w-[42px] text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-1 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-3 bg-slate-300 mx-1" />
          <button
            title="Reset Zoom"
            onClick={() => setZoom(1)}
            className="p-1 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    );
  }
);

EditorCanvas.displayName = 'EditorCanvas';
