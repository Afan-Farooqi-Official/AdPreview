// Scenes service — fetch billboard scene data from Supabase with fallback to mock data.
// Components never call supabase directly.

import { supabase } from '../lib/supabaseClient';
import { mockScenes } from '../mocks/scenes';
import type { Scene } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/** Map Supabase snake_case row → camelCase Scene */
function rowToScene(row: Record<string, unknown>): Scene {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Scene['category'],
    previewImageUrl: row.preview_image_url as string,
    sourceImageUrl: row.source_image_url as string,
    defaultBoundingBox: row.default_bounding_box as Scene['defaultBoundingBox'],
    isProOnly: row.is_pro_only as boolean,
    active: row.active as boolean,
  };
}

export const scenesService = {
  async getScenes(): Promise<Scene[]> {
    if (USE_MOCK) {
      return mockScenes.filter((s) => s.active);
    }

    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error || !data || data.length === 0) {
        // Fallback to local mock scenes if table is empty or unconfigured
        return mockScenes.filter((s) => s.active);
      }
      return data.map(rowToScene);
    } catch {
      // Fallback to mock scenes on network / key error
      return mockScenes.filter((s) => s.active);
    }
  },

  async getScene(id: string): Promise<Scene | null> {
    if (USE_MOCK) {
      return mockScenes.find((s) => s.id === id) ?? null;
    }

    try {
      const { data, error } = await supabase
        .from('scenes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return mockScenes.find((s) => s.id === id) ?? null;
      }
      return rowToScene(data);
    } catch {
      return mockScenes.find((s) => s.id === id) ?? null;
    }
  },
};
