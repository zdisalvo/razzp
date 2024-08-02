import React, { useRef, useEffect, useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import Fireworks from "fireworks-js";
import { Link as RouterLink } from "react-router-dom";

const MatchAnimation = ({ profilePic1, profilePic2 }) => {
    const fireworksRef = useRef(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Initialize fireworks effect
        if (fireworksRef.current) {
            const fireworks = new Fireworks(fireworksRef.current, {
                opacity: 0.6,
                rocketsPoint: { x: 50, y: 50 }
            });
            fireworks.start();

            setTimeout(() => {
                
                    fireworks.stop();
                
            }, 7000);

            //return () => fireworks.stop();
        }
    }, []);

    useEffect(() => {
        // Trigger animation after component mounts
        setIsAnimating(true);
    }, []);

    return (
        <Box position="relative" width="100%" height="300px" overflow="hidden">
            {/* Fireworks container */}
            <Box
                ref={fireworksRef}
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                zIndex={0}
            />

            <Box
                position="absolute"
                top="50%"
                left={isAnimating ? 'calc(50% - 125px)' : '-50px'} // Animate to center
                transform="translateY(-50%)"
                transition="left 1s ease"
                zIndex={1}
                style={{
                    width: '100px',
                    height: '100px',
                }}
            >
                <Image
                    src={profilePic1}
                    borderRadius="100%"
                    boxSize="100px"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                />
            </Box>
            <Box
                position="absolute"
                top="50%"
                right={isAnimating ? 'calc(50% - 125px)' : '-50px'} // Animate to center
                transform="translateY(-50%)"
                transition="right 1s ease"
                zIndex={1}
                style={{
                    width: '100px',
                    height: '100px',
                }}
            >
                <Image
                    src={profilePic2}
                    borderRadius="100%"
                    boxSize="100px"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                />
            </Box>
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex={2}
                style={{
                    opacity: isAnimating ? 1 : 0,
                    transition: 'opacity 1s ease',
                    textAlign: 'center'
                }}
            >
                <RouterLink to="/spark/matches" >
                <Text fontSize="3xl" fontWeight="bold"
                color="white"
                style={{
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.6)"
                }}
                
                >You Matched!</Text>
                </RouterLink>
            </Box>
        </Box>
    );
};

export default MatchAnimation;
