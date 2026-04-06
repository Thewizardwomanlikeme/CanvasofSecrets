
/**
 * Auth Store Utility
 * Persists the Scholar's Biometric Identity and Profile.
 * Uses localStorage for profile metadata and biometric sketch.
 */

export interface VitraProfile {
  name: string;
  enrollmentDate: string;
  sketch: number[]; // Fuzzy extractor sketch for biometric recovery
  identityToken: string; // Challenge/Response token for verifying login key
}

const PROFILE_KEY = 'vitra_scholar_profile';

export const getProfile = (): VitraProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveProfile = (profile: VitraProfile): void => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const clearProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY);
  // Optional: Clear all vault items as well (total burn)
  localStorage.removeItem('vitra_vault'); 
  // Note: IndexedDB 'vault_items' should also be cleared for a total burn
};

export const hasEnrolled = (): boolean => {
  return !!getProfile();
};
