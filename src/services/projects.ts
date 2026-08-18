// Projects service — CRUD for user projects, backed by Supabase or mock.

import { supabase } from '../lib/supabaseClient';
import { mockProjects } from '../mocks/projects';
import { FREE_PROJECT_LIMIT } from '../types';
import type { Project, Transform } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// In-memory mock store (persists in session)
let _mockProjects: Project[] = [...mockProjects];

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    sceneId: row.scene_id as string,
    adImageUrl: row.ad_image_url as string,
    transform: row.transform as Transform,
    resultThumbnailUrl: row.result_thumbnail_url as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const projectsService = {
  async getProjects(userId: string): Promise<Project[]> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return _mockProjects.filter((p) => p.userId === userId);
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToProject);
  },

  async getProject(id: string): Promise<Project | null> {
    if (USE_MOCK) {
      return _mockProjects.find((p) => p.id === id) ?? null;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data ? rowToProject(data) : null;
  },

  /**
   * Save a project. Enforces FREE_PROJECT_LIMIT for free-plan users.
   * Returns the saved project or an error string.
   */
  async saveProject(
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    userPlan: 'free' | 'pro'
  ): Promise<{ project: Project | null; error: string | null }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));

      const userProjects = _mockProjects.filter((p) => p.userId === project.userId);
      if (userPlan === 'free' && userProjects.length >= FREE_PROJECT_LIMIT) {
        return { project: null, error: 'FREE_LIMIT_REACHED' };
      }

      const now = new Date().toISOString();
      const newProject: Project = {
        ...project,
        id: `proj_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      _mockProjects = [newProject, ..._mockProjects];
      return { project: newProject, error: null };
    }

    // Check project count for free users
    if (userPlan === 'free') {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', project.userId);

      if ((count ?? 0) >= FREE_PROJECT_LIMIT) {
        return { project: null, error: 'FREE_LIMIT_REACHED' };
      }
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: project.userId,
        name: project.name,
        scene_id: project.sceneId,
        ad_image_url: project.adImageUrl,
        transform: project.transform,
        result_thumbnail_url: project.resultThumbnailUrl,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) return { project: null, error: error.message };
    return { project: data ? rowToProject(data) : null, error: null };
  },

  async deleteProject(id: string): Promise<{ error: string | null }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      _mockProjects = _mockProjects.filter((p) => p.id !== id);
      return { error: null };
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);
    return { error: error?.message ?? null };
  },

  async uploadAdImage(
    userId: string,
    file: File
  ): Promise<{ url: string | null; error: string | null }> {
    if (USE_MOCK) {
      // In mock mode, return a local object URL (not persisted)
      const url = URL.createObjectURL(file);
      return { url, error: null };
    }

    const ext = file.name.split('.').pop();
    const path = `ads/${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('ads').upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from('ads').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  },
};
