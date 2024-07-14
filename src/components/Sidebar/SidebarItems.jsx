import CreatePost from "./CreatePost";
import Home from "./Home";
import SparkMenu from "./SparkMenu";
import ProfileLink from "./ProfileLink";
import Search from "./Search";

const SidebarItems = () => {
	return (
		<>
			{/* <Home /> */}
			<Search />
			<SparkMenu />
			<CreatePost />
			<ProfileLink />
		</>
	);
};

export default SidebarItems;
