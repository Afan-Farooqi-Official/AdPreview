// ============================================================
// Core TypeScript types — single source of truth for all data shapes.
// These are intentionally decoupled from Supabase's generated types
// so swapping the data source only requires changing the services/ layer.
// ============================================================

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextLayer {
  id: string;
  text: string;
  fontSize: number;
  fill: string;
  fontStyle: 'normal' | 'bold';
  x: number;
  y: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  scaleX?: number;
  scaleY?: number;
  rotation: number;
  skewX?: number;
  skewY?: number;
  depthZ?: number;      // Z-axis perspective depth (-100 to 100)
  shadowDepth?: number; // Z-axis shadow elevation (0 to 50)
  opacity?: number;
  keepRatio?: boolean;
  textBelowImage?: boolean;
  textLayers?: TextLayer[];
}

export type SceneCategory = 'billboard';

export interface Scene {
  id: string;
  name: string;
  category: SceneCategory;
  previewImageUrl: string;
  sourceImageUrl: string;
  defaultBoundingBox: BoundingBox;
  isProOnly: boolean;
  active: boolean;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  sceneId: string;
  adImageUrl: string;
  transform: Transform;
  resultThumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Plan = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  plan: Plan;
  createdAt: string;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  plan: 'pro';
  startedAt: string;
  currentPeriodEnd: string;
}

// ============================================================
// Config constants
// TODO: FUTURE_DECISION — adjust these values as product evolves
// ============================================================
export const FREE_PROJECT_LIMIT = 3;
export const FREE_SCENE_LIMIT = 5; // first N scenes are free
export const MAX_UPLOAD_SIZE_MB = 10;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const STANDARD_EXPORT_MAX_PX = 1280;
export const PRO_PRICE_MONTHLY = '$4.99';

// TODO: FUTURE_DECISION — set to true to apply watermark on free exports
export const ENABLE_WATERMARK = import.meta.env.VITE_ENABLE_WATERMARK === 'true';
