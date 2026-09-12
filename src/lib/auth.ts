import type { AuthSession, Role } from '../types';

/** Every signed-in session belongs to exactly one area of the app. */
export type Area = 'platform' | 'brand' | 'smm' | 'verification';

export const AREA_HOME: Record<Area, string> = {
  platform: '/admin/overview',
  brand: '/admin/brand/overview',
  smm: '/smm/home',
  verification: '/verification',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Brand Admin',
  REVIEWER: 'Reviewer',
  SMM: 'SMM',
};

export function areaFor(session: AuthSession): Area {
  const { user, smm, impersonating } = session;
  if (user.role === 'SMM') {
    return !smm || smm.verification?.status === 'Verified' || !smm.verification ? 'smm' : 'verification';
  }
  if (user.role === 'ADMIN' && !user.brand && !impersonating) return 'platform';
  return 'brand';
}

export const homePathFor = (session: AuthSession | null) => (session ? AREA_HOME[areaFor(session)] : '/login');

export function roleLabel(session: AuthSession): string {
  return session.impersonating ? 'Brand Admin (as Admin)' : ROLE_LABELS[session.user.role];
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('') || '?'
  );
}
