import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

// Define the store
const useSparkProfileStore = create((set) => ({
    sparkProfile: null,
    isLoading: false,
    error: null,

    fetchSparkProfile: async (uid) => {
        set({ isLoading: true, error: null });
        try {
            const docRef = doc(firestore, "spark", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                set({ sparkProfile: docSnap.data(), isLoading: false });
            } else {
                set({ error: "Spark profile not found", isLoading: false });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    setSparkProfile: (sparkProfile) => set({ sparkProfile }),
    addPic: (pic) =>
		set((state) => ({
			sparkProfile: { ...state.sparkProfile, uploadedImages: [pic.id, ...(state.sparkProfile.uploadedImages || [])] },
		})),
    deletePic: (picId) =>
        set((state) => ({
            sparkProfile: {
                ...state.sparkProfile,
                uploadedImages: state.sparkProfile.uploadedImages.filter((id) => id !== picId),
            },
        })),
}));
    

export default useSparkProfileStore;
