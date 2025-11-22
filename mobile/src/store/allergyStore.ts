/**
 * Allergy Profile Store
 *
 * Global state management for user allergies using Zustand
 * Syncs with local storage and optional cloud backup
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe' | 'Anaphylaxis';

export interface Allergy {
  id: string;
  name: string;
  severity: SeverityLevel;
  aliases: string[];
  notes?: string;
  addedAt: string;
}

export interface Sensitivity {
  id: string;
  name: string;
  symptoms: string[];
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface AllergyProfile {
  userId: string;
  allergies: Allergy[];
  sensitivities: Sensitivity[];
  emergencyContacts: EmergencyContact[];
  medicalId?: string;
  epiPenExpiry?: string;
}

interface AllergyStore {
  profile: AllergyProfile;
  isLoading: boolean;
  error: string | null;

  // Actions
  addAllergy: (allergy: Omit<Allergy, 'id' | 'addedAt'>) => void;
  removeAllergy: (id: string) => void;
  updateAllergy: (id: string, updates: Partial<Allergy>) => void;

  addSensitivity: (sensitivity: Omit<Sensitivity, 'id'>) => void;
  removeSensitivity: (id: string) => void;

  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeEmergencyContact: (id: string) => void;

  loadProfile: () => Promise<void>;
  saveProfile: () => Promise<void>;
  clearProfile: () => void;

  getProfileJson: () => string;
}

const STORAGE_KEY = '@allmyallergies:profile';

const createEmptyProfile = (): AllergyProfile => ({
  userId: `user_${Date.now()}`,
  allergies: [],
  sensitivities: [],
  emergencyContacts: [],
});

export const useAllergyStore = create<AllergyStore>((set, get) => ({
  profile: createEmptyProfile(),
  isLoading: false,
  error: null,

  addAllergy: (allergy) => {
    const newAllergy: Allergy = {
      ...allergy,
      id: `allergy_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };

    set((state) => ({
      profile: {
        ...state.profile,
        allergies: [...state.profile.allergies, newAllergy],
      },
    }));

    get().saveProfile();
  },

  removeAllergy: (id) => {
    set((state) => ({
      profile: {
        ...state.profile,
        allergies: state.profile.allergies.filter((a) => a.id !== id),
      },
    }));

    get().saveProfile();
  },

  updateAllergy: (id, updates) => {
    set((state) => ({
      profile: {
        ...state.profile,
        allergies: state.profile.allergies.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      },
    }));

    get().saveProfile();
  },

  addSensitivity: (sensitivity) => {
    const newSensitivity: Sensitivity = {
      ...sensitivity,
      id: `sensitivity_${Date.now()}`,
    };

    set((state) => ({
      profile: {
        ...state.profile,
        sensitivities: [...state.profile.sensitivities, newSensitivity],
      },
    }));

    get().saveProfile();
  },

  removeSensitivity: (id) => {
    set((state) => ({
      profile: {
        ...state.profile,
        sensitivities: state.profile.sensitivities.filter((s) => s.id !== id),
      },
    }));

    get().saveProfile();
  },

  addEmergencyContact: (contact) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}`,
    };

    set((state) => ({
      profile: {
        ...state.profile,
        emergencyContacts: [...state.profile.emergencyContacts, newContact],
      },
    }));

    get().saveProfile();
  },

  removeEmergencyContact: (id) => {
    set((state) => ({
      profile: {
        ...state.profile,
        emergencyContacts: state.profile.emergencyContacts.filter(
          (c) => c.id !== id
        ),
      },
    }));

    get().saveProfile();
  },

  loadProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const profile = JSON.parse(stored);
        set({ profile, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error: 'Failed to load profile',
        isLoading: false,
      });
      console.error('Load profile error:', error);
    }
  },

  saveProfile: async () => {
    try {
      const { profile } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Save profile error:', error);
      set({ error: 'Failed to save profile' });
    }
  },

  clearProfile: () => {
    set({ profile: createEmptyProfile() });
    AsyncStorage.removeItem(STORAGE_KEY);
  },

  getProfileJson: () => {
    const { profile } = get();
    return JSON.stringify(profile);
  },
}));
