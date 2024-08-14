import { create } from 'zustand';

const useLikeStore = create((set) => ({
  likeCount: 0,
  setLikeCount: (count) => set({ likeCount: count }),
  incrementLikeCount: () => set((state) => ({ likeCount: state.likeCount + 1 })),
  decrementLikeCount: () => set((state) => ({ likeCount: state.likeCount - 1 })),
}));

export default useLikeStore;