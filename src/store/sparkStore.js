// src/stores/sparkStore.js
import create from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase/firebase'; // Adjust path as necessary

const useSparkStore = create((set) => ({
  sparkProfiles: [], // Initial state for storing profiles
  isLoading: false,
  error: null,

  // Fetch all spark profiles from Firestore
  fetchAllSparkProfiles: async () => {
    set({ isLoading: true, error: null });

    try {
      const querySnapshot = await getDocs(collection(firestore, 'spark'));
      const profiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ sparkProfiles: profiles, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set the sparkProfiles directly
  setSparkProfiles: (profiles) => set({ sparkProfiles: profiles }),
}));

export default useSparkStore;
