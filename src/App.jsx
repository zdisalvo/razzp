import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import TopFivePosts from "./pages/Top5Posts/TopFivePosts";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ProfilePageFeed from "./pages/ProfilePageFeed/ProfilePageFeed";
import CreateSpark from "./pages/Spark/CreateSpark";
import Spark from "./pages/Spark/Spark";
import SparkMatches from './pages/SparkMatches/SparkMatches';
import SparkMessage from './pages/SparkMatches/SparkMessage';
import Message from './components/Messages/Message';
import Messages from './components/Messages/Messages';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import FollowersPage from './pages/Followers/Followers';
import FollowingPage from './pages/Following/Following';
import SearchPage from './pages/SearchPage/SearchPage';
import BlockPage from './pages/BlockPage/BlockPage';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";
import useAuthStore from "./store/authStore";

function App() {
	const [authUser] = useAuthState(auth);
	const authUserProf = useAuthStore(state => state.user);
	const [showSpark, setShowSpark] = useState(false);
	const [showHome, setShowHome ] = useState(false);

	useEffect(() => {
		const checkAuthUserProf = async () => {
		  if (authUserProf && authUserProf.spark === true) {
			setShowSpark(true);
		  } else {
			setShowSpark(false);
		  }
		};
	
		checkAuthUserProf();
	  }, [authUserProf]);

	  useEffect(() => {
		const checkAuthUserProf = async () => {
		  if (authUserProf && authUserProf.followers.length > 0 === true) {
			setShowHome(true);
		  } else {
			setShowHome(false);
		  }
		};
	
		checkAuthUserProf();
	  }, [authUserProf]);

	// let spark;

	// if (authUserProf.spark === null)
	// 	spark = false;
	// else 
	// 	spark = authUserProf.spark;




	return (
		<PageLayout>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/auth' />} />
				<Route path='/top5' element={<TopFivePosts />} />
				<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
				<Route path='/spark' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <Spark />) : <Navigate to='/' /> } />
				{/* <Route path='/spark' element={authUser ? <Spark /> : <Navigate to='/' /> } /> */}
				<Route path='/spark/edit' element={authUser ? <CreateSpark /> : <Navigate to='/' />} />
				<Route path='/spark/matches' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <SparkMatches />) : <Navigate to='/' /> } />
				<Route path='/spark/matches/msg' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <SparkMessage />) : <Navigate to='/' /> } />
				<Route path='/:username' element={<ProfilePage />} />
				<Route path="/:username/feed" element={<ProfilePageFeed />} />
				<Route path="/:username/messages" element={<Message />} />
				<Route path="/messages" element={<Messages />} />
				<Route path="/notifications" element={<NotificationsPage />} />
				<Route path="/:username/followers" element={<FollowersPage />} />
				<Route path="/:username/following" element={<FollowingPage />} />
				<Route path="/search" element={<SearchPage />} />
				<Route path="/blocked" element={<BlockPage />} />

			</Routes>
		</PageLayout>
	);
}

export default App;
