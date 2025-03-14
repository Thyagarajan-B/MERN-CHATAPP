import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  Icon,
  Avatar,
  InputGroup,
  InputRightElement,
  useToast,
  MenuGroup,
  Center,
} from "@chakra-ui/react";
import { FiSend, FiInfo, FiMessageCircle } from "react-icons/fi";
import UsersList from "./UsersList";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const ChatArea = ({ selectedGroup, socket }) => {
  const [messages, setMessages] = useState([])
  const [newMessages, setNewMessages] = useState("")
  const [connectedUsers, setConnectedUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const messagesEndref = useRef(null)
  const typingTimeoutRef = useRef(null)
  const toast = useToast()
  const currentUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
  // console.log(currentUser);

  // console.log(connectedUsers, "Hello");
  // console.log(users);
  useEffect(() => {
    if (selectedGroup && socket) {
      console.log("Socket connected?", socket.connected);
      fetchMessages();

      console.log("Frontend: Emitting 'join room' with group ID:", selectedGroup?._id);
      socket.emit("join room", selectedGroup?._id);

      socket.on("message received", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on("users in room", (users) => {
        setConnectedUsers(users);
        // console.log(users, "here");
      });

      socket.on("users joined", (user) => {
        setConnectedUsers((prev) => [...prev, user]); // Corrected
      });

      socket.on("notification", (notification) => {
        toast({
          title: notification?.type === "USER_JOINED" ? "New User" : "Notification",
          description: notification.message,
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-right", // Corrected
        });
      });

      socket.on("user typing", (user) => {
        setTypingUsers((prev) => new Set(prev).add(user.userName));
      });

      socket.on("user stop typing", (user) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(user.userName); // Corrected
          return newSet;
        });
      });

      return () => {
        socket.emit("leave room", selectedGroup?._id);
        socket.off("message received");
        socket.off("users in room");
        socket.off("users joined");
        socket.off("notification");
        socket.off("user typing");
        socket.off("user stop typing");
      };
    }
  }, [selectedGroup, socket, toast]);

  // Fetch messages
  const fetchMessages = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo?.token) {
      toast({
        title: "Authentication Error",
        description: "User token not found. Please log in again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/messages/${selectedGroup?._id}`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      setMessages(data);

    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error);
      toast({
        title: "Error fetching messages",
        description: error.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Send messages
  const sendMessage = async () => {
    if (!newMessages) {
      return;
    }
    try {
      const token = currentUser.token;
      const { data } = await axios.post("http://localhost:5000/api/messages", {
        content: newMessages,
        groupId: selectedGroup?._id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      socket.emit("new message", {
        ...data,
        groupId: selectedGroup?._id,
      });

      setMessages((prevMessages) => [...prevMessages, data]);

      setNewMessages("")
    } catch (error) {
      toast({
        title: "Error sending messages",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }
  // Handle Typing
  const handleTyping = (e) => {
    setNewMessages(e.target.value);
    if (!isTyping && selectedGroup) {
      setIsTyping(true);
      socket.emit("typing", {
        groupId: selectedGroup?._id,
        username: currentUser.userName
      });
    }
    // clear existing time out
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup) {
        socket.emit("stop typing", {
          groupId: selectedGroup?._id
        })
      }
      setIsTyping(false);
    }, 1000)
  };

  //Format Typing
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-Us", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  // Reneder typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;

    return Array.from(typingUsers).map((username) => (
      <Box
        key={username}
        alignSelf={username === currentUser?.userName ? "flex-start" : "flex-end"}
        maxW="70%"
      >
        <Flex align="center" bg={username === currentUser?.userName ? "blue.50" : "gray.50"} p={2} borderRadius="lg" gap={2}>
          {username === currentUser?.userName ? (
            <>
              <Avatar size="xs" name={username} />
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  You are typing...
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box key={dot} w="3px" h="3px" borderRadius="full" bg="gray.500" />
                  ))}
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" gap={1}>
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  {currentUser?.userName} is typing...
                </Text>
                <Flex gap={1}>
                  {[1, 2, 3].map((dot) => (
                    <Box key={dot} w="3px" h="3px" borderRadius="full" bg="gray.500" />
                  ))}
                </Flex>
              </Flex>
              <Avatar size="xs" name={username} />
            </>
          )}
        </Flex>
      </Box>
    ));
  };

  return (
    <Flex
      h="100%"
      position="relative"
      direction={{ base: "column", lg: "row" }}
    >
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        bg="gray.50"
        maxW={{ base: "100%", lg: `calc(100% - 260px)` }}
      >
        {/* Chat Header */}
        {selectedGroup ? (
          <>
            <Flex
              px={6}
              py={4}
              bg="white"
              borderBottom="1px solid"
              borderColor="gray.200"
              align="center"
              boxShadow="sm"
            >
              <Button
                display={{ base: "inline-flex", md: "none" }}
                variant="ghost"
                mr={2}
                onClick={() => setSelectedGroup(null)}
              >
                ←
              </Button>
              <Icon
                as={FiMessageCircle}
                fontSize="24px"
                color="blue.500"
                mr={3}
              />
              <Box flex="1">
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {selectedGroup.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {selectedGroup.description}
                </Text>
              </Box>
              <Icon
                as={FiInfo}
                fontSize="20px"
                color="gray.400"
                cursor="pointer"
                _hover={{ color: "blue.500" }}
              />
            </Flex>

            {/* Messages Area */}
            <VStack
              flex="1"
              key={currentUser.userName}
              overflowY="auto"
              spacing={4}
              align="stretch"
              px={6}
              py={4}
              position="relative"
              sx={{
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "gray.200",
                  borderRadius: "24px",
                },
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message._id}
                  alignSelf={
                    message.sender._id === currentUser?._id
                      ? "flex-start"
                      : "flex-end"
                  }
                  maxW="70%"
                >
                  <Flex direction="column" gap={1}>
                    <Flex
                      align="center"
                      mb={1}
                      justifyContent={
                        message.sender._id === currentUser?._id
                          ? "flex-start"
                          : "flex-end"
                      }
                      gap={2}
                    >
                      {message.sender._id === currentUser?._id ? (
                        <>
                          <Avatar size="xs" name={message.sender.username} />
                          <Text fontSize="xs" color="gray.500">
                            You • {formatTime(message.createdAt)}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text fontSize="xs" color="gray.500">
                            {message.sender.username} •{" "}
                            {formatTime(message.createdAt)}
                          </Text>
                          <Avatar size="xs" name={message.sender.username} />
                        </>
                      )}
                    </Flex>

                    <Box
                      bg={
                        message?.sender._id === currentUser?._id
                          ? "blue.500"
                          : "white"
                      }
                      color={
                        message?.sender._id === currentUser?._id
                          ? "white"
                          : "gray.800"
                      }
                      p={3}
                      borderRadius="lg"
                      boxShadow="sm"
                    >
                      <Text>{message.content}</Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
              {renderTypingIndicator()}
              <div ref={messagesEndref} />  
            </VStack>

            {/* Message Input */}
            <Box
              p={4}
              bg="white"
              borderTop="1px solid"
              borderColor="gray.200"
              position="relative"
              zIndex="1"
            >
              <InputGroup size="lg">
                <Input
                  value={newMessages}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  pr="4.5rem"
                  bg="gray.50"
                  border="none"
                  _focus={{
                    boxShadow: "none",
                    bg: "gray.100",
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    colorScheme="blue"
                    borderRadius="full"
                    _hover={{
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                    onClick={sendMessage}
                  >
                    <Icon as={FiSend} />
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </>
        ) : (
          <>
            <Flex
              h="100%"
              direction="column"
              align="center"
              justify="center"
              p={8}
              textAlign="center"
            >
              <Icon
                as={FiMessageCircle}
                fontSize="64px"
                color="gray.300"
                mb={4}
              />
              <Text fontSize="xl" fontWeight="medium" color="gray.500" mb={2}>
                Welcome to the Chat
              </Text>
              <Text color="gray.500" mb={2}>
                Select a group from the sidebar to start chatting
              </Text>
            </Flex>
          </>
        )}
      </Box>

      {/* UsersList with responsive width */}
      <Box
        width={{ base: "100%", lg: "260px" }}
        position={{ base: "static", lg: "sticky" }}
        right={0}
        top={0}
        height={{ base: "auto", lg: "100%" }}
        flexShrink={0}
        display={{ base: "none", lg: "block" }}
      >
        {selectedGroup && <UsersList users={connectedUsers} />}
      </Box>
    </Flex>
  );
};


export default ChatArea;
