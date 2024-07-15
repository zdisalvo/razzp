import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ProfilePageFeed from "./pages/ProfilePageFeed/ProfilePageFeed";
import CreateSpark from "./pages/Spark/CreateSpark";
import Spark from "./pages/Spark/Spark";
import SparkMatches from './pages/SparkMatches/SparkMatches';
import SparkMessage from './pages/SparkMatches/SparkMessage';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase/firebase";
import useAuthStore from "./store/authStore";

function App() {
	const [authUser] = useAuthState(auth);
	const authUserProf = useAuthStore(state => state.user);
	const [showSpark, setShowSpark] = useState(false);

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

	// let spark;

	// if (authUserProf.spark === null)
	// 	spark = false;
	// else 
	// 	spark = authUserProf.spark;




	return (
		<PageLayout>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/auth' />} />
				<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
				<Route path='/spark' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <Spark />) : <Navigate to='/' /> } />
				{/* <Route path='/spark' element={authUser ? <Spark /> : <Navigate to='/' /> } /> */}
				<Route path='/spark/edit' element={authUser ? <CreateSpark /> : <Navigate to='/' />} />
				<Route path='/spark/matches' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <SparkMatches />) : <Navigate to='/' /> } />
				<Route path='/spark/matches/msg' element={authUser ? (!showSpark  ? <Navigate to='/spark/edit' /> : <SparkMessage />) : <Navigate to='/' /> } />
				<Route path='/:username' element={<ProfilePage />} />
				<Route path="/:username/feed" element={<ProfilePageFeed />} />

			</Routes>
		</PageLayout>
	);
}

export default App;
