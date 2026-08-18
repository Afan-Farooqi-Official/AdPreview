import type { Project } from '../types';

// Fictional mock projects — no real PII, example.com emails only
export const mockProjects: Project[] = [
  {
    id: 'proj_001',
    userId: 'usr_mock_1',
    name: 'Highway Billboard — Daytime (Sample)',
    sceneId: 'scn_001',
    adImageUrl: '/mock/ads/sample-ad.png',
    transform: { x: 295, y: 130, scale: 1.0, rotation: 0 },
    resultThumbnailUrl: '/mock/thumbs/proj_001.jpg',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-08-10T09:05:00Z',
  },
  {
    id: 'proj_002',
    userId: 'usr_mock_1',
    name: 'City Street — Night (Demo)',
    sceneId: 'scn_004',
    adImageUrl: '/mock/ads/sample-ad.png',
    transform: { x: 320, y: 100, scale: 0.95, rotation: 0 },
    resultThumbnailUrl: '/mock/thumbs/proj_002.jpg',
    createdAt: '2026-08-12T14:30:00Z',
    updatedAt: '2026-08-12T14:35:00Z',
  },
  {
    id: 'proj_003',
    userId: 'usr_mock_1',
    name: 'Building-Mounted (Sample)',
    sceneId: 'scn_005',
    adImageUrl: '/mock/ads/sample-ad.png',
    transform: { x: 260, y: 110, scale: 1.05, rotation: 0 },
    resultThumbnailUrl: '/mock/thumbs/proj_003.jpg',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:08:00Z',
  },
];
