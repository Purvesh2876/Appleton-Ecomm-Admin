import React, { useEffect, useState } from 'react';
import { 
  Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, 
  Spinner, Center, Icon, Flex, Text, Button, Container, useColorModeValue 
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MdInventory, MdPeople, MdShoppingCart, MdAttachMoney, MdWarning, MdCategory } from 'react-icons/md';
import { getDashboardData } from '../actions/apiActions';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const brandColor = "#A22B21";
  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardData();
        if (res.data.success) setData(res.data.stats);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Center h="60vh"><Spinner size="xl" color={brandColor} /></Center>;

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={8} fontFamily="'Playfair Display', serif" color={brandColor}>
        Business Command Center
      </Heading>

      {/* PRIMARY METRICS GRID */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={10}>
        <DashboardStat 
          label="Total Revenue" 
          number={`₹${data?.totalRevenue?.toLocaleString('en-IN')}`} 
          icon={MdAttachMoney} 
          color="green.500" 
          bg={bgColor}
        />
        <DashboardStat 
          label="Orders" 
          number={data?.orderCount} 
          help={`${data?.pendingOrders} Pending Action`}
          icon={MdShoppingCart} 
          color="blue.500" 
          bg={bgColor}
        />
        <DashboardStat 
          label="Active Users" 
          number={data?.userCount} 
          icon={MdPeople} 
          color="purple.500" 
          bg={bgColor}
        />
        <DashboardStat 
          label="Stock Alert" 
          number={data?.outOfStock} 
          help="Products out of stock"
          icon={MdWarning} 
          color="red.500" 
          bg={bgColor}
        />
      </SimpleGrid>

      {/* QUICK MANAGEMENT ACTIONS */}
      <Heading size="md" mb={6} fontFamily="'Playfair Display', serif">Management Portal</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4}>
        <ActionBtn to="/category" label="Categories" icon={MdCategory} />
        <ActionBtn to="/products" label="Products" icon={MdInventory} />
        <ActionBtn to="/users" label="Customers" icon={MdPeople} />
        <ActionBtn to="/orders" label="Sales Orders" icon={MdShoppingCart} />
      </SimpleGrid>
    </Container>
  );
};

// Sub-component for individual Stat Cards
const DashboardStat = ({ label, number, help, icon, color, bg }) => (
  <Stat p={5} shadow="sm" border="1px solid" borderColor="gray.100" borderRadius="lg" bg={bg}>
    <Flex justify="space-between" align="center">
      <Box>
        <StatLabel fontWeight="medium" color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold">{number}</StatNumber>
        {help && <StatHelpText color="orange.500" fontWeight="bold">{help}</StatHelpText>}
      </Box>
      <Icon as={icon} w={8} h={8} color={color} />
    </Flex>
  </Stat>
);

// Sub-component for Action Buttons
const ActionBtn = ({ to, label, icon }) => (
  <Button
    as={RouterLink}
    to={to}
    variant="outline"
    height="auto"
    py={6}
    display="flex"
    flexDirection="column"
    gap={2}
    _hover={{ bg: "gray.50", borderColor: "#A22B21", color: "#A22B21" }}
  >
    <Icon as={icon} boxSize={6} />
    <Text fontSize="sm">{label}</Text>
  </Button>
);

export default AdminDashboard;