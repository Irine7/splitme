import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AddressEntry {
  address: `0x${string}`;
  ownerName: string;
}

interface AddressBookState {
  entries: AddressEntry[];
  addEntry: (entry: AddressEntry) => { success: boolean; error?: string };
  removeEntry: (address: `0x${string}`) => void;
  getOwnerByAddress: (address: `0x${string}`) => string | undefined;
  getAddressesByOwner: (ownerName: string) => `0x${string}`[];
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

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry) => {
        const { entries } = get();
        
        // Check if wallet address already exists
        const existingEntry = entries.find(e => e.address.toLowerCase() === entry.address.toLowerCase());
        if (existingEntry) {
          return { 
            success: false, 
            error: `Адрес ${entry.address} уже принадлежит ${existingEntry.ownerName}` 
          };
        }
        
        // Add the new entry
        set({ entries: [...entries, entry] });
        return { success: true };
      },
      
      removeEntry: (address) => {
        const { entries } = get();
        set({
          entries: entries.filter(e => e.address.toLowerCase() !== address.toLowerCase())
        });
      },
      
      getOwnerByAddress: (address) => {
        const { entries } = get();
        const entry = entries.find(e => e.address.toLowerCase() === address.toLowerCase());
        return entry?.ownerName;
      },
      
      getAddressesByOwner: (ownerName) => {
        const { entries } = get();
        return entries
          .filter(e => e.ownerName === ownerName)
          .map(e => e.address);
      }
    }),
    {
      name: 'address-book-storage', // unique name for localStorage key
      storage: createClientStorage(),
    }
  )
);
