import { create } from 'zustand';

const useAuthStoreEffect = create((set) => ({
  authUserDoc: null, // Initial state for authenticated user
  setAuthUserDoc: (user) => set({ authUserDoc: user }), // Method to update authUser
}));

export default useAuthStoreEffect;