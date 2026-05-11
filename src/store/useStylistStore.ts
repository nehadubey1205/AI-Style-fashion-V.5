import { create } from 'zustand';

interface UserPreferences {
  destination?: string;
  budget?: number;
  duration?: string;
  occasion?: string;
  aesthetic?: string[];
  season?: string;
}

interface StylistState {
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  results: any[];
  addResult: (result: any) => void;
  clearResults: () => void;
}

export const useStylistStore = create<StylistState>((set) => ({
  preferences: {},
  setPreferences: (prefs) => set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  results: [],
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  clearResults: () => set({ results: [] }),
}));
