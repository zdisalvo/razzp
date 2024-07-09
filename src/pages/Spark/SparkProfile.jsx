import React from 'react';
import { Box, Image, Text, SimpleGrid, VStack, Container, Button } from '@chakra-ui/react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const SparkProfile = ({ sparkProfile }) => {
  const {
    name,
    bio,
    work,
    school,
    gender,
    interested_in,
    location,
    hometown,
    ethnicity,
    height,
    exercise,
    education_level,
    drinking,
    smoking,
    cannabis,
    looking_for,
    family_plans,
    have_kids,
    star_sign,
    politics,
    religion,
    pronouns,
    languages,
    interests,
    profilePics,
  } = sparkProfile;

  const profileData = [
    { label: 'Bio', value: bio },
    { label: 'Work', value: work },
    { label: 'School', value: school },
    { label: 'Gender', value: gender },
    { label: 'Interested in', value: interested_in },
    { label: 'Location', value: location },
    { label: 'Hometown', value: hometown },
    { label: 'Ethnicity', value: ethnicity },
    { label: 'Height', value: height },
    { label: 'Exercise', value: exercise },
    { label: 'Education Level', value: education_level },
    { label: 'Drinking', value: drinking },
    { label: 'Smoking', value: smoking },
    { label: 'Cannabis', value: cannabis },
    { label: 'Looking for', value: looking_for },
    { label: 'Family Plans', value: family_plans },
    { label: 'Have Kids', value: have_kids },
    { label: 'Star Sign', value: star_sign },
    { label: 'Politics', value: politics },
    { label: 'Religion', value: religion },
    { label: 'Pronouns', value: pronouns },
    { label: 'Languages', value: languages },
    { label: 'Interests', value: interests },
  ];

  const buttonStyle = {
    backgroundColor: "#1B2328",
    color: 'white',
    py: "10px",
    margin: '4px 2px',
    borderRadius: '7px',
    display: 'inline-block',
    userSelect: 'none',
    pointerEvents: 'none',
    _hover: { backgroundColor: "#1B2328" },
    _active: { backgroundColor: "#1B2328" },
  };

  const filteredProfileData = profileData.filter(item => item.value && (Array.isArray(item.value) ? item.value.length > 0 : true));

  return (
    <Container width={{ base: "100vw", md: "auto" }} height={{ base: "auto", md: "100%" }} mb={{ base: "60px", md: "100px" }}>
      <Box>
        <Carousel showThumbs={false}>
          {profilePics.map((pic, index) => (
            <Box key={index}>
              <Image src={pic.imageURL} alt={`Profile picture ${index + 1}`} />
            </Box>
          ))}
          <Box p={4}>
            <VStack spacing={4} align="left">
              {filteredProfileData.slice(0, Math.ceil(filteredProfileData.length / 2)).map((data, index) => (
                <Box key={index}>
                  <Text><strong>{data.label}:</strong></Text>
                  {Array.isArray(data.value) ? (
                    data.value.map((item, subIndex) => (
                      <Button key={subIndex} size="sm" style={buttonStyle} m={1} display="flex"
                      alignItems="center"
                      justifyContent="center"> 
                        {item}
                      </Button>
                    ))
                  ) : (
                    <Button size="sm" style={buttonStyle} m={1} display="flex"
                      alignItems="center"
                      justifyContent="center"> 
                        {data.value}
                      </Button>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
          <Box p={4}>
            <VStack spacing={4} align="left">
              {filteredProfileData.slice(Math.ceil(filteredProfileData.length / 2)).map((data, index) => (
                <Box key={index} align="left">
                  <Text><strong>{data.label}:</strong></Text>
                  {Array.isArray(data.value) ? (
                    data.value.map((item, subIndex) => (
                      <Button key={subIndex} size="sm" style={buttonStyle} m={1} display="flex"
                      alignItems="center"
                      justifyContent="center">
                        {item}
                      </Button>
                    ))
                  ) : (
                    <Button size="sm" style={buttonStyle} m={1} display="flex"
                      alignItems="center"
                      justifyContent="center"> 
                        {data.value}
                      </Button>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        </Carousel>
        <Box bg="gray.100" p={4} textAlign="center">
          <Text fontSize="xl" fontWeight="bold">{name}</Text>
        </Box>
      </Box>
    </Container>
  );
};

export default SparkProfile;
