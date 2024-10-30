import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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
    HStack,
    Input,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import useAuthStore from "../../store/authStore";

const CreatorModal = ({ isOpen, onClose }) => {
    const authUser = useAuthStore((state) => state.user);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [grossEarnings, setGrossEarnings] = useState(0);
    const [netEarnings, setNetEarnings] = useState(0);
    const [balance, setBalance] = useState(0);
    const [payments, setPayments] = useState(0);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [topPurchasers, setTopPurchasers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchCreatorData();
        }
    }, [isOpen, startDate, endDate]);

    const fetchCreatorData = async () => {
        if (!authUser) return;

        try {
            const bonusRef = collection(firestore, "bonus", authUser.uid, "creator");
            const querySnapshot = await getDocs(bonusRef);
            const purchases = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));

            const userRef = doc(collection(firestore, "users"), authUser.uid);
            const userDocSnap = await getDoc(userRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setGrossEarnings(userData.creatorGross || 0);
                setNetEarnings(userData.creatorNet || 0);
                setPayments(userData.creatorPayments || 0);
            }

            const filteredPurchases = purchases.filter((purchase) => {
                const purchaseDate = new Date(purchase.date);
                const isAfterStart = startDate ? purchaseDate >= new Date(startDate) : true;
                const isBeforeEnd = endDate ? purchaseDate <= new Date(endDate) : true;
                return isAfterStart && isBeforeEnd;
            });

            setFilteredPurchases(filteredPurchases);

            // Compute category breakdown
            const breakdown = {};
            filteredPurchases.forEach((purchase) => {
                const type = purchase.purchaseType;
                if (breakdown[type]) {
                    breakdown[type].gross += purchase.gross;
                    breakdown[type].net += purchase.net;
                } else {
                    breakdown[type] = {
                        gross: purchase.gross,
                        net: purchase.net,
                    };
                }
            });
            setCategoryBreakdown(Object.entries(breakdown).map(([type, totals]) => ({
                type,
                gross: totals.gross,
                net: totals.net,
            })));

            // Compute top purchasers in descending order by gross amount
            const purchaserTotals = {};
            filteredPurchases.forEach((purchase) => {
                const purchaser = purchase.purchaser || "Unknown";
                if (purchaserTotals[purchaser]) {
                    purchaserTotals[purchaser].gross += purchase.gross;
                    purchaserTotals[purchaser].net += purchase.net;
                } else {
                    purchaserTotals[purchaser] = {
                        gross: purchase.gross,
                        net: purchase.net,
                    };
                }
            });

            const sortedPurchasers = Object.entries(purchaserTotals)
                .map(([purchaser, totals]) => ({
                    purchaser,
                    gross: totals.gross,
                    net: totals.net,
                }))
                .sort((a, b) => b.gross - a.gross);

            setTopPurchasers(sortedPurchasers);
        } catch (error) {
            console.error("Failed to fetch creator data:", error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Creator Earnings Summary</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box mb={4}>
                        <Text fontWeight="bold">Earnings Summary</Text>
                        <Text>Gross Earnings: ${grossEarnings.toFixed(2)}</Text>
                        <Text>Net Earnings: ${netEarnings.toFixed(2)}</Text>
                        <Text>Payments: ${payments.toFixed(2)}</Text>
                        <Text>Balance: ${(netEarnings - payments).toFixed(2)}</Text>
                    </Box>

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
                        <Button onClick={fetchCreatorData} colorScheme="teal">
                            Search
                        </Button>
                    </HStack>

                    {/* Purchase Breakdown Table */}
                    <Box mb={4}>
                        <Text fontWeight="bold">Purchase Breakdown by Category</Text>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Category</Th>
                                    <Th>Gross</Th>
                                    <Th>Net</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {categoryBreakdown.length > 0 ? (
                                    categoryBreakdown.map((category, index) => (
                                        <Tr key={index}>
                                            <Td>{category.type}</Td>
                                            <Td>${category.gross.toFixed(2)}</Td>
                                            <Td>${category.net.toFixed(2)}</Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan="3" textAlign="center" color="gray.500">
                                            No purchases found for the selected range.
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>

                    {/* Top Purchasers Table */}
                    <Box mb={4}>
                        <Text fontWeight="bold">Top Purchasers</Text>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Purchaser</Th>
                                    <Th>Gross</Th>
                                    <Th>Net</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {topPurchasers.length > 0 ? (
                                    topPurchasers.map((purchaser, index) => (
                                        <Tr key={index}>
                                            <Td>{purchaser.purchaser}</Td>
                                            <Td>${purchaser.gross.toFixed(2)}</Td>
                                            <Td>${purchaser.net.toFixed(2)}</Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan="3" textAlign="center" color="gray.500">
                                            No purchasers found for the selected range.
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
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
