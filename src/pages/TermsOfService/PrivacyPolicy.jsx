import React from "react"; 
import { ChakraProvider, Container, Heading, Text } from "@chakra-ui/react";

const PrivacyPolicy = () => { 
  return (
    <ChakraProvider>
      <Container
        p={0}
        maxW={{ base: "100vw", md: "100vw" }}
        pb={{ base: "5vh", md: "30px" }}
        pt={{ base: "0px", md: "20px" }}
        m={0}
        display="flex"
        alignItems="flex-start"
        flexDirection="column"
        bg="black"
        color="white"
        minH="100vh"
      >
        <Container
          maxW="700px"
          textAlign="justify"
          lineHeight="1.6"
          p="1rem"
          mt="2rem"
        >
          <Heading as="h1" size="xl" textAlign="center" mb="1rem">
            Privacy Policy for Razzp.com by Westclosed com
          </Heading>
          <Text>
            <strong>Effective Date:</strong> December 4th, 2024
          </Text>
          <Text>
            Razzp.com, operated by Westclosed com, values your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our platform. By using Razzp.com, you agree to the practices described in this policy.
          </Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            1. Information We Collect
          </Heading>
          <Text>
            We collect the following types of information to provide and improve our services:
          </Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            A. Information You Provide Directly:
          </Heading>
          <Text>
            - Account Information: Name, email address, phone number, profile picture, and other account details.<br />
            - Content and Communications: Content you upload, post, or share, including photos, videos, comments, and messages.<br />
            - Payment Information: Financial details necessary for processing transactions, such as payment method and billing address.
          </Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            B. Information We Collect Automatically:
          </Heading>
          <Text>
            - Usage Data: Information about how you interact with the platform, including navigation, searches, and content engagement.<br />
            - Device Information: Details such as your IP address, device type, operating system, browser type, and language settings.<br />
            - Cookies and Similar Technologies: Data collected via cookies, pixel tags, and other technologies to enhance your user experience.
          </Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            C. Information from Third Parties:
          </Heading>
          <Text>
            - Social Media Integrations: If you link your Razzp.com account to social media platforms, we may receive your profile details and activity data.<br />
            - Partners and Affiliates: Data from third-party partners to enhance your experience or ensure compliance.
          </Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            2. How We Use Your Information
          </Heading>
          <Text>
            We use the information we collect for the following purposes:
          </Text>
          <Text>- Service Delivery: To provide and improve our services, personalize your experience, and process transactions.</Text>
          <Text>- Communication: To send notifications, updates, and marketing communications (you can opt out anytime).</Text>
          <Text>- Safety and Security: To verify accounts, monitor suspicious activities, and prevent fraud or illegal conduct.</Text>
          <Text>- Analytics and Improvements: To analyze trends, measure platform performance, and develop new features.</Text>
          <Text>- Compliance: To comply with legal obligations and enforce our Terms of Service.</Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            3. Sharing Your Information
          </Heading>
          <Text>
            We share your information only as necessary and in accordance with this policy:
          </Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            A. With Other Users:
          </Heading>
          <Text>Your public profile and shared content may be visible to other users based on your privacy settings.</Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            B. With Third-Party Service Providers:
          </Heading>
          <Text>Payment processors, hosting providers, analytics services, and customer support tools.</Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            C. For Legal and Safety Reasons:
          </Heading>
          <Text>- When required by law, regulation, or legal process.<br />
            - To protect the rights, safety, and property of Razzp.com, its users, or others.
          </Text>
          <Heading as="h3" size="md" mt="1rem" mb="0.5rem">
            D. With Your Consent:
          </Heading>
          <Text>When you explicitly agree to share information for specific purposes.</Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            4. Your Privacy Choices
          </Heading>
          <Text>- **Privacy Settings:** Adjust your account settings to control who can see your profile and content.</Text>
          <Text>- **Data Access and Portability:** Request a copy of your personal data in a portable format.</Text>
          <Text>- **Data Deletion:** Request deletion of your account and personal data. Note that some information may be retained for legal or operational reasons.</Text>
          <Text>- **Cookies Management:** Manage cookies through your browser or device settings.</Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            5. Data Retention
          </Heading>
          <Text>
            We retain your information for as long as necessary to provide our services or comply with legal obligations. When no longer required, your data will be securely deleted or anonymized.
          </Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            6. Data Security
          </Heading>
          <Text>
            We implement industry-standard measures to protect your data from unauthorized access, disclosure, or loss. However, no system is completely secure, and we encourage you to take precautions to protect your account credentials.
          </Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            7. International Data Transfers
          </Heading>
          <Text>
            Razzp.com operates globally, and your information may be transferred to and processed in countries outside your residence. We comply with applicable laws for international data transfers.
          </Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            8. Updates to This Privacy Policy
          </Heading>
          <Text>
            We may update this Privacy Policy periodically. Changes will be posted on this page, and we will notify you of significant updates. Continued use of the platform after updates constitutes acceptance of the changes.
          </Text>

          <Heading as="h2" size="lg" mt="1.5rem" mb="0.5rem">
            9. Contact Us
          </Heading>
          <Text>
            If you have questions about this Privacy Policy or your privacy rights, please contact us at:  
            <br />
            **Email:** razzp.com@gmail.com
          </Text>

          <Text mt="1.5rem">
            By using Razzp.com, you acknowledge that you have read, understood, and agreed to this Privacy Policy.
          </Text>
        </Container>
      </Container>
    </ChakraProvider>
  );
};

export default PrivacyPolicy;
