import { create } from "zustand";

const useSparkImageStore = create((set) => ({
	pics: [],
	createPic: (pic) => set((state) => ({ pics: [pic, ...state.pics] })),
	deletePic: (id) => set((state) => ({ pics: state.pics.filter((pic) => pic.id !== id) })),
	setPics: (pics) => set({ pics }),
}));

export default useSparkImageStore;