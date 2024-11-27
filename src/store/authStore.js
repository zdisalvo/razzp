import { create } from 'zustand';
import { firestore } from '../firebase/firebase'; // Adjust the import based on your project structure
import { doc, getDoc } from 'firebase/firestore';

// Define the Zustand store
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user-info')) || null,
  //subscriptions: [], //
  login: (user) => {
    localStorage.setItem('user-info', JSON.stringify(user));
    set({ user });
    //set({ user, subscriptions: user.subscriptions || [] });
  },
  logout: () => {
    localStorage.removeItem('user-info');
    set({ user: null });
  },
  setUser: (user) => {
    localStorage.setItem('user-info', JSON.stringify(user));
    set({ user });
    //set({ user, subscriptions: user.subscriptions || [] });
  },
  fetchUserData: async (userId) => {
    try {
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        //console.log(userData);
        localStorage.setItem('user-info', JSON.stringify(userData));
        set({ user: userData });
        //set({ user: userData, subscriptions: userData.subscriptions || [] });
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
