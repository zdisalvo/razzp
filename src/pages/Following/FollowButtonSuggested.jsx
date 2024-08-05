import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/react";
import useFollowUserFP from "../../hooks/useFollowUserFP";
import useUnrequestFollow from "../../hooks/useUnrequestFollow";
import useAuthStore from "../../store/authStore";

const FollowButton = ({ userProfile, isFollowing: initialIsFollowing, requested: requestedVal }) => {
    const authUser = useAuthStore((state) => state.user);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);
    const [requested, setRequested] = useState(requestedVal);
    const { handleFollowUser } = useFollowUserFP();
    const unrequestFollow = useUnrequestFollow();

    // useState(() => {
    //     if (userProfile && authUser && userProfile.requested) {
    //         setRequested(userProfile.requested.includes(authUser.uid));
    //     }
    // }, [userProfile]);

    //console.log(requested);

    const handleFollowClick = async () => {
        if (!isFollowing && userProfile.private && !requested) {
            setRequested(true);
        } else if (!isFollowing && userProfile.private && requested) {
            unrequestFollow(userProfile.uid);
            setRequested(false);
        } else {
            setIsFollowing((prev) => !prev);
            setIsOptimisticUpdate(true);
        }

        //console.log(userProfile);

        try {
            await handleFollowUser(userProfile, userProfile.uid, isFollowing, !requested);
        } catch (error) {
            setIsFollowing((prev) => !prev);
            console.error("Error updating follow status:", error);
        } finally {
            setIsOptimisticUpdate(false);
        }
    };

    return (
        <Button
            ml={3}
            bg={"#eb7734"}
            color={"white"}
            _hover={{ bg: "#c75e1f" }}
            textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
            size={{ base: "sm", md: "xs" }}
            onClick={handleFollowClick}
            isDisabled={isOptimisticUpdate}
        >
            {isFollowing ? "Unfollow" : (requested ? "Requested" : "Follow")}
        </Button>
    );
};

export default FollowButton;
