import { Box, Flex, useToast } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const ENDPOINT = "http://localhost:5000";
const token = localStorage.getItem("token")

// This is the chat file
const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (!userInfo?.token) {
      toast({
        title: "Session Expired",
        description: "Please log in again.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newSocket = io(ENDPOINT, {
      auth:{
        token: userInfo.token,
        user: userInfo // Send full user object
      },
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [toast]);

  return (
    <Flex h="100vh">
      <Box w="300px" borderRight="1px solid" borderColor="gray.200">
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </Box>
      <Box flex="1">
        <ChatArea selectedGroup={selectedGroup} socket={socket} />
      </Box>
    </Flex>
  );
};

export default Chat;
