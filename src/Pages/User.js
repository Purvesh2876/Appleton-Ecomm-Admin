// usersPage.js
import React, { useState, useEffect } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner ,Image, ButtonGroup, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Stack, FormControl, FormLabel, Input} from '@chakra-ui/react';
import { EditIcon,DeleteIcon} from '@chakra-ui/icons'
import axios from 'axios';

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);



  const fetchusers = async () => {
    try {
      const response = await axios.get('http://localhost:3999/admin/users', {
          withCredentials: true,
        });
      setUsers(response.data);
      console.log(response.data)
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchusers();
  }, []);







  return (
    <Box p={4}>
      <Heading mb={4}>users Management</Heading>
      {/* <Button color={'blueviolet'} ><EditIcon />Add users</Button> */}

      {loading ? (
        <Spinner size="xl" />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              {/* <Th>Name</Th> */}
              <Th>Email</Th>
              <Th>Activate Orders</Th>
              <Th>cart</Th>
              {/* <Th>Price</Th> */}
              {/* <Th>Availble Sizes</Th> */}
              {/* <Th>Stock</Th> */}
              {/* <Th>Function</Th> */}
              {/* Add more columns as needed */}
            </Tr>
          </Thead>
          <Tbody>
            {users.map((users) => (
              <Tr key={users._id}>
                <Td>{users.email}</Td>
                {/* <Td><Image borderRadius={5} src={`http://localhost:3999${users.image}`} height={'60px'} width={'80px'} /></Td> */}
                {/* <Td>{users.email}</Td> */}
                {/* <Td>{users.tag}</Td> */}
                <Td>{users.orders.length}</Td>
                <Td>{users.cart.length}</Td>
                {/* <Td>{users.stocks}</Td> */}
                {/* <Td> */}
                    {/* <ButtonGroup> */}
                    {/* <Button color={'blueviolet'}><EditIcon /></Button> */}
                    {/* <Button color={'red'} ><DeleteIcon /></Button> */}
                    {/* </ButtonGroup> */}
                {/* </Td> */}
                
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}


    </Box>
  );
};

export default UsersPage;
