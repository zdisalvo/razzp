import { create } from 'zustand';
import { firestore } from '../firebase/firebase'; // Adjust the import based on your project structure
import { doc, getDoc } from 'firebase/firestore';

// Define the Zustand store
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user-info')) || null,
  login: (user) => {
    localStorage.setItem('user-info', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user-info');
    set({ user: null });
  },
  setUser: (user) => {
    localStorage.setItem('user-info', JSON.stringify(user));
    set({ user });
  },
  fetchUserData: async (userId) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('user-info', JSON.stringify(userData));
        set({ user: userData });
      } else {
        console.warn('User document does not exist');
        localStorage.removeItem('user-info');
        set({ user: null });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },
}));

export default useAuthStore;
