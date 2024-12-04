import { create } from "zustand";

const useFeedPostStore = create((set) => ({
	feedPosts: [],
	createFeedPost: (feedPost) => set((state) => ({ feedPosts: [feedPost, ...state.feedPosts] })),
	deleteFeedPost: (id) => set((state) => ({ feedPosts: state.feedPosts.filter((feedPost) => feedPost.id !== id) })),
	setFeedPosts: (feedPosts) => set({ feedPosts }),
	addComment: (feedPostId, comment) =>
		set((state) => ({
			feedPosts: state.posts.map((feedPost) => {
				if (feedPost.id === feedPostId) {
					return {
						...feedPost,
						comments: [...feedPost.comments, comment],
					};
				}
				return feedPost;
			}),
		})),
}));

export default useFeedPostStore;
