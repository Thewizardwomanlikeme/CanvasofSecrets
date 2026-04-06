
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, hasEnrolled, saveProfile, clearProfile, VitraProfile } from '../utils/authStore';
import { loadModels } from '../utils/faceKey';

interface AuthContextType {
  profile: VitraProfile | null;
  isIdentified: boolean;
  enroll: (name: string, sketch: number[], identityToken: string) => void;
  login: () => void;
  burnIdentity: () => void;
  lockSanctum: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<VitraProfile | null>(getProfile());
  const [isIdentified, setIsIdentified] = useState<boolean>(false);

  // Sync profile if enrollment exists but state is empty
  useEffect(() => {
    // 1. Pre-load biometric models globally for near-instant access later
    loadModels().catch(console.error);

    // 2. Load profile
    if (!profile && hasEnrolled()) {
      setProfile(getProfile());
    }
  }, []);

  const enroll = (name: string, sketch: number[], identityToken: string) => {
    const newProfile: VitraProfile = {
      name,
      enrollmentDate: new Date().toISOString(),
      sketch,
      identityToken
    };
    saveProfile(newProfile);
    setProfile(newProfile);
    setIsIdentified(true);
  };

  const login = () => {
    // This is called AFTER biometric verification in AccessGate
    setIsIdentified(true);
  };

  const burnIdentity = () => {
    clearProfile();
    setProfile(null);
    setIsIdentified(false);
  };

  const lockSanctum = () => {
    setIsIdentified(false);
  };

  return (
    <AuthContext.Provider value={{ profile, isIdentified, enroll, login, burnIdentity, lockSanctum }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
