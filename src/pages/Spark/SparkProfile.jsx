import React from 'react';
import { Box, Image, Text, SimpleGrid, VStack } from '@chakra-ui/react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const SparkProfile = ({ sparkProfile }) => {
  const {
    name,
    bio,
    birthday,
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
    { label: 'Birthday', value: birthday },
    { label: 'Work', value: work },
    { label: 'School', value: school },
    { label: 'Gender', value: gender },
    { label: 'Interested in', value: interested_in.join(', ') },
    { label: 'Location', value: location },
    { label: 'Hometown', value: hometown },
    { label: 'Ethnicity', value: ethnicity.join(', ') },
    { label: 'Height', value: height },
    { label: 'Exercise', value: exercise },
    { label: 'Education Level', value: education_level },
    { label: 'Drinking', value: drinking },
    { label: 'Smoking', value: smoking },
    { label: 'Cannabis', value: cannabis },
    { label: 'Looking for', value: looking_for.join(', ') },
    { label: 'Family Plans', value: family_plans },
    { label: 'Have Kids', value: have_kids },
    { label: 'Star Sign', value: star_sign },
    { label: 'Politics', value: politics },
    { label: 'Religion', value: religion },
    { label: 'Pronouns', value: pronouns.join(', ') },
    { label: 'Languages', value: languages.join(', ') },
    { label: 'Interests', value: interests.join(', ') },
  ];

  return (
    <Box>
      <Carousel showThumbs={false}>
        {profilePics.map((pic, index) => (
          <Box key={index}>
            <Image src={pic.imageURL} alt={`Profile picture ${index + 1}`} />
          </Box>
        ))}
        <Box p={4}>
          <VStack spacing={4} align="left">
            {profileData.slice(0, Math.ceil(profileData.length / 2)).map((data, index) => (
              <Text key={index}><strong>{data.label}:</strong> {data.value}</Text>
            ))}
          </VStack>
        </Box>
        <Box p={4}>
          <VStack spacing={4} align="left">
            {profileData.slice(Math.ceil(profileData.length / 2)).map((data, index) => (
              <Text key={index}><strong>{data.label}:</strong> {data.value}</Text>
            ))}
          </VStack>
        </Box>
      </Carousel>
      <Box bg="gray.100" p={4} textAlign="center">
        <Text fontSize="xl" fontWeight="bold">{name}</Text>
      </Box>
    </Box>
  );
};

export default SparkProfile;
