import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Group {
  id: number;
  name: string;
  creator: `0x${string}`;
  members: `0x${string}`[];
  createdAt: number;
}

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  addGroup: (group: Group) => void;
  setGroups: (groups: Group[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create a custom storage object that only works on the client side
const createClientStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
  
  return createJSONStorage(() => localStorage);
};

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [],
      isLoading: false,
      error: null,
      addGroup: (group) => set((state) => ({
        groups: [...state.groups, group],
      })),
      setGroups: (groups) => set({ groups }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'group-storage', // unique name for localStorage key
      storage: createClientStorage(),
    }
  )
);
