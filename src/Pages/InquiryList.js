import React, { useEffect, useState } from "react";
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Heading,
    Spinner, useToast, Badge, Text, Flex
} from "@chakra-ui/react";
import axios from "axios";
import { getAllInquiries } from "../actions/apiActions";

const InquiryList = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const getInquiries = async () => {
        try {
            const token = localStorage.getItem("token");
            // const { data } = await axios.get("http://localhost:5000/api/inquiry/all", {
            //     headers: { Authorization: `Bearer ${token}` }
            // });
            const data = await getAllInquiries();
            console.log('inquiries', data);
            setInquiries(data.inquiries);
        } catch (error) {
            toast({ title: "Error fetching data", status: "error", duration: 3000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { getInquiries(); }, []);

    if (loading) return <Flex justify="center" mt={20}><Spinner size="xl" /></Flex>;

    return (
        <Box p={8} bg="white" minH="100vh">
            <Heading mb={8} color="#A22B21" fontFamily="'Playfair Display', serif">
                Customer Export Inquiries
            </Heading>

            <Box overflowX="auto" shadow="md" borderRadius="lg" border="1px solid" borderColor="gray.100">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Date</Th>
                            <Th>Customer</Th>
                            <Th>Subject</Th>
                            <Th>Message</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {inquiries.map((iq) => (
                            <Tr key={iq._id} _hover={{ bg: "gray.50" }}>
                                <Td fontSize="xs">{new Date(iq.createdAt).toLocaleDateString()}</Td>
                                <Td>
                                    <Text fontWeight="bold" fontSize="sm">{iq.name}</Text>
                                    <Text fontSize="xs" color="gray.500">{iq.email}</Text>
                                    <Text fontSize="xs" color="gray.500">{iq.phone}</Text>
                                </Td>
                                <Td fontSize="sm" fontWeight="medium" maxW="200px">{iq.subject}</Td>
                                <Td fontSize="xs" color="gray.600" maxW="400px" whiteSpace="normal">
                                    {iq.message}
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default InquiryList;