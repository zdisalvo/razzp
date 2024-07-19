import create from 'zustand';

const useMsgStore = create((set) => ({
  userId: null,
  matchedUserId: null,
  setUserId: (id) => set({ userId: id }),
  setReceivingUserId: (id) => set({ receivingUserId: id }),
}));

export default useMsgStore;