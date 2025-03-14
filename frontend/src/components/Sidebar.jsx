import {
  Box,
  VStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Icon,
  Badge,
  Tooltip,
  useRadio,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiCloudLightning, FiCreditCard, FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ setSelectedGroup }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newGroupName, setNewGroupName] = useState("");
  const [groups, setGroups] = useState([]);
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const toast = useToast();
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
  }, []);

  // Check if logged-in user is Admin.
  const checkAdminStatus = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    setIsAdmin(userInfo?.isAdmin || false);
  };

  // Fetch all groups.
  const fetchGroups = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.token;

      const { data } = await axios.get("http://localhost:5000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGroups(data.groups);

      // Get User Groups
      const userGroupIds = data.groups
        .filter((group) => group?.members.some((member) => member?._id === userInfo?._id))
        .map((group) => group?._id);

      setUserGroups(userGroupIds);
    } catch (error) {
      console.error(error);
    }
  };

  // Create Group
  const handleCreateGroup = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.token;
      await axios.post(
        "http://localhost:5000/api/groups",
        {
          name: newGroupName,
          description: newGroupDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast({
        title: "Group Created",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchGroups();
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      toast({
        title: "Error Creating Group",
        status: "error",
        duration: 3000,
        isClosable: true,
        description: error?.response?.data?.message || "An Error Occurred",
      });
    }
  };

  // Join Group
  const handleJoinGroup = async (groupId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo.token;
      // console.log(token);

      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchGroups()
      setSelectedGroup(groups.find(g => g?._id === groupId))
      toast({
        title: "Joined Group Successfuly",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error Joining Group",
        status: "error",
        duration: 3000,
        isClosable: true,
        description: error?.response?.data?.message || "An Error Occurred",
      });
    }
  }

  // Leave Group
  const handleLeaveGroup = async (groupId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      // console.log(userInfo);

      const token = userInfo.token;
      // console.log(token);

      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchGroups();
      setSelectedGroup(null);
      toast({ title: "Left Group Successfully", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Error Leaving Group", status: "error", duration: 3000, isClosable: true, description: error?.response?.data?.message || "An Error Occurred" });
    }
  };

  // Logout 
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  
  return (
    <Box h="100%" bg="white" borderRight="1px" borderColor="gray.200" width="300px" display="flex" flexDirection="column">
      {/* Header */}
      <Flex p={4} borderBottom="1px solid" borderColor="gray.200" bg="white" position="sticky" top={0} zIndex={1} align="center" justify="space-between">
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button size="sm" colorScheme="blue" variant="ghost" onClick={onOpen} borderRadius="full">
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      {/* Groups List */}
      <Box flex="1" overflowY="auto" p={4} mb={16}>
        <VStack spacing={3} align="stretch">
          {groups.map((group) => (
            <Box
              key={group._id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroups.includes(group?._id) ? "blue.50" : "gray.50"}
              borderWidth="1px"
              borderColor={userGroups.includes(group?._id) ? "blue.200" : "gray.200"}
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: "blue.300",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box onClick={() => userGroups.includes(group?._id) && setSelectedGroup(group)} flex="1">
                  <Flex align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.800">
                      {group.name}
                    </Text>
                    {userGroups.includes(group?._id) && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {group.description}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme={userGroups.includes(group?._id) ? "red" : "blue"}
                  variant={userGroups.includes(group?._id) ? "ghost" : "solid"}
                  ml={3}
                  _hover={{
                    transform: userGroups.includes(group?._id) ? "scale(1.05)" : "none",
                    bg: userGroups.includes(group?._id) ? "red.50" : "blue.600",
                  }}
                  transition="all 0.2s"
                  onClick={() =>
                    userGroups.includes(group?._id) ? handleLeaveGroup(group._id) : handleJoinGroup(group._id)
                  }
                >
                  {userGroups.includes(group?._id) ? "Leave" : "Join"}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Logout Button */}
      <Box p={4} borderTop="1px solid" borderColor="gray.200" bg="gray.50" position="absolute" bottom={0} left={0} right={0}>
        <Button onClick={handleLogout} as={Link} to="/login" variant="ghost" colorScheme="red" leftIcon={<Icon as={FiLogOut} />}>
          Logout
        </Button>
      </Box>

      {/* Create Group Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Enter group name" />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="Enter group description" />
            </FormControl>
            <Button colorScheme="blue" mt={4} width="full" onClick={handleCreateGroup}>
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;