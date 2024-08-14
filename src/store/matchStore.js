import { create } from 'zustand';

const useMatchStore = create((set) => ({
  userId: null,
  matchedUserId: null,
  setUserId: (id) => set({ userId: id }),
  setMatchedUserId: (id) => set({ matchedUserId: id }),
}));

export default useMatchStore;