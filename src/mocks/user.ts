import type { User } from '../types';

// Fictional demo user — example.com email, clearly not real PII
export const mockUser: User = {
  id: 'usr_mock_1',
  email: 'demo.user@example.com',
  plan: 'free',
  createdAt: '2026-08-01T00:00:00Z',
};
