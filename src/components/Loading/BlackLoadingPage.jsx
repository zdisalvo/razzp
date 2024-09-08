import React from 'react';
import { Container, Image } from '@chakra-ui/react'

const BlackLoadingPage = () => {
  const styles = {
    container: {
      width: '100vw',
      height: '450px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      //paddingBottom: '17vh',
    },
    image: {
      maxWidth: '250px',
      maxHeight: '250px',
      objectFit: 'contain',
    },
  };

  return (
    <Container style={styles.container} >
      {/* <Image src="/razzp-logo-matte.png" alt="Loading" style={styles.image} /> */}
    </Container>
  );
};

export default BlackLoadingPage;
