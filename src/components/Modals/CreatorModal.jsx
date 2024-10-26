import React, { useEffect, useState } from "react";
import { doc, getDoc, collection } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Box,
    Text,
    VStack,
    Avatar,
    Spinner,
    Input,
    Button,
    HStack,
} from "@chakra-ui/react";
import useAuthStore from "../../store/authStore";

const CreatorModal = ({ isOpen, onClose }) => {
    const authUser = useAuthStore((state) => state.user); // Fetching the authenticated user's info
    const [topSpenders, setTopSpenders] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [grossEarnings, setGrossEarnings] = useState(0);
    const [netEarnings, setNetEarnings] = useState(0);
    const [payments, setPayments] = useState(0);
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTopSpenders();
        }
    }, [isOpen, startDate, endDate]);

    const fetchTopSpenders = async () => {
        if (!authUser) return; // Ensure authUser is available

        setIsLoading(true);
        try {
            const bonusRef = collection(firestore, "bonus");
            const creatorDocRef = doc(bonusRef, authUser.uid);

            const creatorDocSnap = await getDoc(creatorDocRef);

            if (creatorDocSnap.exists()) {
                const creatorData = creatorDocSnap.data();

                // Set earnings and balance values
                setGrossEarnings(creatorData.gross || 0);
                setNetEarnings(creatorData.net || 0);
                setPayments(creatorData.payments || 0);
                setBalance(creatorData.balance || 0);

                // Get the purchases array from the creator document
                const purchases = creatorData.purchases || [];

                // Filter purchases based on the selected date range
                const filteredPurchases = purchases.filter((purchase) => {
                    const purchaseDate = new Date(purchase.date);
                    const isAfterStart = startDate ? purchaseDate >= new Date(startDate) : true;
                    const isBeforeEnd = endDate ? purchaseDate <= new Date(endDate) : true;
                    return isAfterStart && isBeforeEnd;
                });

                // Calculate total spending for each purchaser within the date range
                const spenderTotals = {};
                filteredPurchases.forEach((purchase) => {
                    if (spenderTotals[purchase.purchasedByUsername]) {
                        spenderTotals[purchase.purchasedByUsername].gross += purchase.gross;
                        spenderTotals[purchase.purchasedByUsername].net += purchase.net;
                    } else {
                        spenderTotals[purchase.purchasedByUsername] = {
                            gross: purchase.gross,
                            net: purchase.net,
                        };
                    }
                });

                // Convert the spender totals object to an array and sort by total gross spending
                const sortedSpenders = Object.entries(spenderTotals)
                    .map(([username, totals]) => ({
                        username,
                        gross: totals.gross,
                        net: totals.net,
                    }))
                    .sort((a, b) => b.gross - a.gross)
                    .slice(0, 5); // Limit to top 5 spenders

                setTopSpenders(sortedSpenders);
            } else {
                console.error("No creator document found for the user:", authUser.uid);
            }
        } catch (error) {
            console.error("Failed to fetch top spenders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Top Spenders</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {/* Earnings Summary */}
                    <Box mb={4}>
                        <Text fontWeight="bold">Earnings Summary</Text>
                        <Text>Gross Earnings: ${grossEarnings.toFixed(2)}</Text>
                        <Text>Net Earnings: ${netEarnings.toFixed(2)}</Text>
                        <Text>Payments: ${payments.toFixed(2)}</Text>
                        <Text>Balance: ${balance.toFixed(2)}</Text>
                    </Box>

                    {/* Date Range Filter */}
                    <HStack spacing={3} mb={4}>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder="Start Date"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            placeholder="End Date"
                        />
                        <Button onClick={fetchTopSpenders} colorScheme="teal">
                            Search
                        </Button>
                    </HStack>

                    {isLoading ? (
                        <Spinner size="md" />
                    ) : (
                        <VStack spacing={3} align="start">
                            {topSpenders.length > 0 ? (
                                topSpenders.map((spender, index) => (
                                    <Box key={index} display="flex" alignItems="center">
                                        <Avatar name={spender.username} />
                                        <Box ml={3}>
                                            <Text fontWeight="bold">{spender.username}</Text>
                                            <Text color="gray.500">
                                                Gross Spending: ${spender.gross.toFixed(2)}
                                            </Text>
                                            <Text color="gray.500">
                                                Net Spending: ${spender.net.toFixed(2)}
                                            </Text>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Text mt={4} color="gray.600">No spenders found for the selected range.</Text>
                            )}
                        </VStack>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreatorModal;
