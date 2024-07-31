import { Avatar, Flex, Skeleton, SkeletonCircle, Text, Container } from "@chakra-ui/react";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import { Link } from "react-router-dom";
import { timeAgo } from "../../utils/timeAgo";

const Comment = ({ comment }) => {
	const { userProfile, isLoading } = useGetUserProfileById(comment.createdBy);

	console.log(userProfile);

	if (isLoading) return <CommentSkeleton />;
	return (
		<Container width="80%">

		<Flex gap={4} align="center" >
		<Link to={`/${userProfile.username}`}>
			<Avatar src={userProfile.profilePicURL} size={"sm"} />
		</Link>
		
		<Flex direction="column" gap={1}>
			{/* Username and Timestamp Side by Side */}
			<Flex direction="row" alignItems="center" gap={2}>
				<Link to={`/${userProfile.username}`}>
					<Text fontWeight={"bold"} fontSize={12}>
						{userProfile.username}
					</Text>
				</Link>
				<Text fontSize={12} color={"gray"}>
					{timeAgo(comment.createdAt)}
				</Text>
			</Flex>
			
			{/* Comment Text */}
			<Text fontSize={14} maxWidth="100%">
				{comment.comment}
			</Text>
		</Flex>
	</Flex>
	</Container>
	);
};

export default Comment;

const CommentSkeleton = () => {
	return (
		<Flex gap={4} w={"full"} alignItems={"center"}>
			<SkeletonCircle h={10} w='10' />
			<Flex gap={1} flexDir={"column"}>
				<Skeleton height={2} width={100} />
				<Skeleton height={2} width={50} />
			</Flex>
		</Flex>
	);
};
