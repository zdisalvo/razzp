import create from 'zustand';

const useSparkCrownStore = create((set) => ({
  crownCount: 0,
  setCrownCount: (count) => set({ crownCount: count }),
  incrementCrownCount: () => set((state) => ({ crownCount: state.crownCount + 1 })),
  decrementCrownCount: () => set((state) => ({ crownCount: state.crownCount - 1 })),
}));

export default useSparkCrownStore;