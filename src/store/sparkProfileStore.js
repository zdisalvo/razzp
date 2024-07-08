import { create } from "zustand";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import useAuthStore from "./authStore";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../firebase/firebase";

const useSparkProfileStore = create((set, get) => ({
    sparkProfile: null,
    isLoading: false,
    error: null,

    fetchSparkProfile: async () => {
        const { user } = useAuthStore.getState(); // Get the authUser from the store
        if (!user) {
            set({ error: "User not authenticated", isLoading: false });
            return;
        }

        const uid = user.uid;
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
            sparkProfile: {
                ...state.sparkProfile,
                uploadedImages: [pic.id, ...(state.sparkProfile.uploadedImages || [])],
            },
        })),
    deletePic: (picId) =>
        set((state) => ({
            sparkProfile: {
                ...state.sparkProfile,
                uploadedImages: state.sparkProfile.uploadedImages.filter((id) => id !== picId),
            },
        })),
    deleteSelectedImage: async (imageId) => {
        const { user } = useAuthStore.getState(); // Get the authUser from the store
        if (!user) {
            console.error("User not authenticated.");
            return;
        }

        set({ isLoading: true });
        const { sparkProfile } = get(); // Get the latest state

        if (!sparkProfile) {
            console.error("Spark profile not found.");
            set({ isLoading: false });
            return;
        }
        
        console.log(sparkProfile);

        try {

            // Update the user's Spark profile to remove the image reference
            const updatedSelectedImages = sparkProfile.selectedImages.filter((image) => image.id !== imageId);
            await updateDoc(doc(firestore, "spark", user.uid), {
                selectedImages: updatedSelectedImages,
            });

            // Update Zustand state
            set({
                sparkProfile: {
                    ...sparkProfile,
                    selectedImages: updatedSelectedImages,
                },
                isLoading: false,
            });

            console.log("Image deleted successfully.");
        } catch (error) {
            console.error("Error deleting image:", error.message);
            set({ isLoading: false });
        }
    },
}));

export default useSparkProfileStore;
