import { useLocation } from 'react-router-dom';
import CreatePost from "./CreatePost";
//import Home from "./Home";
import SparkMenu from "./SparkMenu";
import SparkMatches from './SparkMatches';
import SparkEdit from './SparkEdit';
import ProfileLink from "./ProfileLink";
import Search from "./Search";
import useAuthStore from '../../store/authStore';

const SidebarItems = () => {
	const authUser = useAuthStore((state) => state.user);

	const location = useLocation();
	const currentPath = location.pathname;

	return (
		<>
			{/* <Home /> */}
			<Search />
			<SparkMenu />
			{currentPath === '/spark' && <SparkEdit />}
			{currentPath === '/spark/edit' && <SparkEdit />}
			{currentPath === '/spark/matches' && <SparkEdit />}
			{currentPath === '/spark' && <SparkMatches />}
			{currentPath === '/spark/edit' && <SparkMatches />}
			{currentPath === '/spark/matches' && <SparkMatches />}
			{currentPath !== '/spark' && currentPath !== '/spark/edit' && currentPath !== '/spark/matches' && <CreatePost /> }
			{currentPath !== '/spark' && currentPath !== '/spark/edit' && currentPath !== '/spark/matches' && <ProfileLink /> }
		</>
	);
};

export default SidebarItems;
