import React from 'react';
import { Box, Image, Text, SimpleGrid, VStack, Container, Button, Flex, Icon } from '@chakra-ui/react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import WineBarRoundedIcon from '@mui/icons-material/WineBarRounded';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCannabis, faBriefcase, faWineGlass, faRuler, faDumbbell, faGraduationCap, faSmoking } from '@fortawesome/free-solid-svg-icons'; 


const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if the current month is before the birth month or if it's the birth month but the current day is before the birth day
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };

const SparkProfile = ({ sparkProfile }) => {
  const {
    name,
    birthday,
    bio,
    work,
    school,
    gender,
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
    { label: 'Age', value: calculateAge(birthday) },
    { label: 'Bio', value: bio },
    { label: 'Work', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faBriefcase} style={{ marginRight: '8px' }} /> {work}
        </Flex>
      )},
    { label: 'School', value: school },
    { label: 'Gender', value: gender },
    { label: 'Location', value: location },
    { label: 'Hometown', value: hometown },
    { label: 'Ethnicity', value: ethnicity },
    { label: 'Height', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faRuler} style={{ marginRight: '8px' }} /> {height}
        </Flex>
      )},
      { label: 'Exercise', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faDumbbell} style={{ marginRight: '8px' }} /> {exercise}
        </Flex>
      )},
      { label: 'Education Level', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '8px' }} /> {education_level}
        </Flex>
      )},
    { label: 'Drinking', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faWineGlass} style={{ marginRight: '8px' }} /> {drinking}
        </Flex>
      )},
      { label: 'Smoking', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faSmoking} style={{ marginRight: '8px' }} /> {smoking}
        </Flex>
      )},
    { label: 'Cannabis', value: (
        <Flex align="center">
          <FontAwesomeIcon icon={faCannabis} style={{ marginRight: '8px' }} /> {cannabis}
        </Flex>
      )},
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
        <Box bg="#1B2328" p={4} textAlign="center">
        <Flex align="center" justify="center" direction="row" wrap="wrap">
          <Text fontSize="xl" fontWeight="bold" mr={5}>{name}</Text>
          {filteredProfileData.find(item => item.label === 'Age') &&
          <Text fontSize="xl" fontWeight="bold">{filteredProfileData.find(item => item.label === 'Age').value}</Text>
            }
          </Flex>
        </Box>
      </Box>
    </Container>
  );
};

export default SparkProfile;
