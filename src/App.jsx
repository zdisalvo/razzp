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
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Creators from './pages/Creators/Creators';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
	const [userAuth] = useAuthState(auth);
	const authUser = useAuthStore((state) => state.user);
	const authUserProf = useAuthStore(state => state.user);
	const [showSpark, setShowSpark] = useState(null);
	const [showHome, setShowHome ] = useState(false);
	

	// useEffect(() => {
	// 	const preventDefault = (e) => e.preventDefault();
	  
	// 	document.addEventListener("contextmenu", preventDefault);
	// 	document.addEventListener("touchstart", preventDefault);
	  
	// 	return () => {
	// 	  document.removeEventListener("contextmenu", preventDefault);
	// 	  document.removeEventListener("touchstart", preventDefault);
	// 	};
	//   }, []);
	  

	  useEffect(() => {
		const preventCopy = (e) => {
		  e.preventDefault(); // Prevent copy
		};
	  
		// Prevent text selection
		document.addEventListener("selectstart", preventCopy);
	  
		// Prevent copy action
		document.addEventListener("copy", preventCopy);
	  
		return () => {
		  document.removeEventListener("selectstart", preventCopy);
		  document.removeEventListener("copy", preventCopy);
		};
	  }, []);
	  

	useEffect(() => {
		if (!userAuth || !authUserProf || showSpark === false || showSpark) {
			//setShowSpark(false);
			return;
		}

		//console.log(showSpark);
			
		const checkAuthUserProf = async () => {
		  if (authUserProf && authUserProf.spark === true) {
			setShowSpark(true);
		  } else {
			setShowSpark(false);
		  }
		};
	
		checkAuthUserProf();
	  }, );
	  //[authUserProf.spark]

	  

	//   useEffect(() => {
	// 	const checkAuthUserProf = async () => {
	// 	  if (authUserProf && authUserProf.following.length > 0 === true) {
	// 		setShowHome(true);
	// 	  } else {
	// 		setShowHome(false);
	// 	  }
	// 	};
	
	// 	checkAuthUserProf();
	//   }, [authUserProf]);

	// let spark;

	// if (authUserProf.spark === null)
	// 	spark = false;
	// else 
	// 	spark = authUserProf.spark;
	



	return (
		<Elements stripe={stripePromise}>
		<PageLayout>
			<Routes>
				{/* <Route path='/' element={authUser ? (authUser && showHome ? <HomePage /> : <Navigate to='/top5' /> ): <Navigate to='/auth' />} /> */}
				{/* <Route path='/' element={userAuth ? <HomePage /> : <Navigate to='/auth' />} /> */}
				<Route path='/' element={userAuth  && authUser && authUser.following && authUser.following.length > 0 
					&& !(userAuth && authUser && authUser.following.length === 1 && authUser.following.includes(authUser.uid)) ? <HomePage /> : <Navigate to='/top5' />} />
				<Route path='/top5' element={<TopFivePosts />} />
				<Route path='/auth' element={!userAuth ? <AuthPage /> : <Navigate to='/' />} />
				<Route path='/spark' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <Spark />) : <Navigate to='/' /> } />
				{/* <Route path='/spark' element={authUser ? <Spark /> : <Navigate to='/' /> } /> */}
				<Route path='/spark/edit' element={authUser ? <CreateSpark /> : <Navigate to='/' />} />
				<Route path='/spark/matches' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <SparkMatches />) : <Navigate to='/' /> } />
				<Route path='/spark/matches/msg' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <SparkMessage />) : <Navigate to='/' /> } />
				
				<Route path='/:username' element={<ProfilePage />} />
				<Route path="/:username/feed" element={<ProfilePageFeed />} /> 

				<Route path="/:username/messages" element={authUser ? <Message /> : <Navigate to='/auth' />} />
				<Route path="/messages" element={authUser ? <Messages /> : <Navigate to='/auth' />} />
				<Route path="/notifications" element={authUser ? <NotificationsPage /> : <Navigate to='/auth' />} />
				<Route path="/:username/followers" element={authUser ? <FollowersPage /> : <Navigate to='/auth' />} />
				<Route path="/:username/following" element={authUser ? <FollowingPage /> : <Navigate to='/auth' />} />
				<Route path="/search" element={<SearchPage />} />
				<Route path="/blocked" element={authUser ? <BlockPage /> : <Navigate to='/auth' />} />
				<Route path="/creators" element={<Creators />} />

			</Routes>
		</PageLayout>
		</Elements>
	);
}

export default App;
