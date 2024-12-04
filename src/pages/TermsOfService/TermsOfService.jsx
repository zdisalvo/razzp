import React from "react";
import { ChakraProvider, Container, Heading, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom"; // Import the Link component

const TermsOfService = () => {
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
            Terms of Service for Razzp.com by Westclosed com
          </Heading>
          <Text mb="1rem">
            Effective Date: December 4th, 2024
          </Text>
          <Text mb="1rem">
            Welcome to Razzp.com, a service operated by Westclosed com. By accessing or using our platform, you agree to these Terms of Service ("Terms"). Please read them carefully before using our services.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            1. The Razzp.com Service
          </Heading>
          <Text mb="1rem">
            Razzp.com is a platform that allows users to share, monetize, and engage with content. We provide tools for creating and managing profiles, posting content, and connecting with other users. Our services include both free and paid features to enhance your experience.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            2. Eligibility
          </Heading>
          <Text mb="1rem">
            <strong>Minimum Age:</strong> You must be at least 18 years old or the age of majority in your jurisdiction to use our platform.
          </Text>
          <Text mb="1rem">
            <strong>Compliance:</strong> You agree to comply with all applicable laws and regulations when using Razzp.com.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            3. User Accounts
          </Heading>
          <Text mb="1rem">
            <strong>Account Creation:</strong> To access our services, you must create an account by providing accurate and complete information.
          </Text>
          <Text mb="1rem">
            <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for any activity under your account.
          </Text>
          <Text mb="1rem">
            <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account if you violate these Terms.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            4. Content Guidelines
          </Heading>
          <Text mb="1rem">
            <strong>User-Generated Content:</strong> You retain ownership of any content you post but grant Razzp.com a worldwide, non-exclusive, royalty-free license to display, distribute, and promote your content on our platform.
          </Text>
          <Text mb="1rem">
            <strong>Prohibited Content:</strong> You may not post content that:
          </Text>
          <Text ml="2rem" mb="1rem">
            - Is illegal, fraudulent, or violates any intellectual property rights.
          </Text>
          <Text ml="2rem" mb="1rem">
            - Contains nudity, pornography, or sexually explicit material outside designated areas.
          </Text>
          <Text ml="2rem" mb="1rem">
            - Promotes hate speech, violence, or harassment.
          </Text>
          <Text mb="1rem">
            <strong>Content Review:</strong> Razzp.com may remove or restrict access to content that violates these Terms or is deemed inappropriate at our sole discretion.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            5. Monetization and Payments
          </Heading>
          <Text mb="1rem">
            <strong>Paid Subscriptions:</strong> Creators can offer paid subscriptions to their content. Razzp.com takes a service fee of [insert percentage] from each transaction.
          </Text>
          <Text mb="1rem">
            <strong>Payouts:</strong> Funds earned through Razzp.com will be disbursed to creators based on our payout schedule, subject to applicable fees and taxes.
          </Text>
          <Text mb="1rem">
            <strong>Refunds:</strong> All purchases on Razzp.com are final and non-refundable, except as required by law.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            6. User Obligations
          </Heading>
          <Text mb="1rem">
            By using Razzp.com, you agree to:
          </Text>
          <Text ml="2rem" mb="1rem">
            - Provide accurate and up-to-date information.
          </Text>
          <Text ml="2rem" mb="1rem">
            - Refrain from engaging in any fraudulent or deceptive activity.
          </Text>
          <Text ml="2rem" mb="1rem">
            - Respect the intellectual property rights of others.
          </Text>
          <Text ml="2rem" mb="1rem">
            - Avoid activities that harm the platform, including spamming, hacking, or distributing malware.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            7. Privacy
          </Heading>
          <Text mb="1rem">
            Your privacy is important to us. Please review our <Link to="/privacy" style={{ color: "lightblue", textDecoration: "underline" }}>Privacy Policy</Link> to understand how we collect, use, and share your information.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            8. Intellectual Property
          </Heading>
          <Text mb="1rem">
            <strong>Ownership:</strong> Razzp.com and its associated trademarks, logos, and content are the property of Westclosed. You may not use, copy, or distribute them without prior written consent.
          </Text>
          <Text mb="1rem">
            <strong>User Content:</strong> While users retain ownership of their content, by posting on Razzp.com, you grant us a license to use, display, and promote your content as outlined in these Terms.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            9. Disclaimer of Warranties
          </Heading>
          <Text mb="1rem">
            Razzp.com is provided "as is" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, error-free, or free of harmful components.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            10. Limitation of Liability
          </Heading>
          <Text mb="1rem">
            To the extent permitted by law, Razzp.com and Westclosed will not be liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to loss of revenue, data, or goodwill.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            11. Termination
          </Heading>
          <Text mb="1rem">
            We reserve the right to suspend or terminate your access to Razzp.com at our discretion, with or without prior notice, if you violate these Terms or engage in conduct harmful to the platform or its users.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            12. Changes to These Terms
          </Heading>
          <Text mb="1rem">
            We may update these Terms from time to time. The updated Terms will be effective upon posting, and your continued use of Razzp.com constitutes acceptance of the changes.
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            13. Governing Law
          </Heading>
          <Text mb="1rem">
            These Terms are governed by the laws of [Insert Jurisdiction], without regard to its conflict of laws principles. Any disputes arising under these Terms shall be resolved exclusively in the courts of [Insert Jurisdiction].
          </Text>

          <Heading as="h2" size="lg" mb="1rem">
            14. Contact Us
          </Heading>
          <Text mb="1rem">
            If you have any questions about these Terms, please contact us at razzp.com@gmail.com.
          </Text>

          <Text mb="1rem">
            By using Razzp.com, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </Text>
        </Container>
      </Container>
    </ChakraProvider>
  );
};

export default TermsOfService;
