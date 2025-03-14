import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  Icon,
  SimpleGrid,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FiMessageSquare,
  FiUsers,
  FiLock,
  FiLogIn,
  FiUserPlus,
  FiGlobe,
  FiActivity,
  FiUserCheck,
  FiType,
  FiLogOut,
} from "react-icons/fi";

const Footer = () => {
  return (
    <Box bg="blue.50" color="gray.600" py={4} textAlign="center" borderTop="1px" borderColor="blue.100">
      <Text fontSize="sm">© {new Date().getFullYear()} ChatApp. All rights reserved.</Text>
    </Box>
  );
};

const Feature = ({ title, text, icon, badges = [] }) => {
  return (
    <Stack
      bg="white"
      rounded="xl"
      p={6}
      spacing={4}
      border="1px solid"
      borderColor="gray.200"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "lg",
      }}
      transition="all 0.3s ease"
    >
      <Flex
        w={16}
        h={16}
        align="center"
        justify="center"
        color="white"
        rounded="full"
        bg="blue.500"
      >
        {icon}
      </Flex>
      <Box>
        <HStack spacing={2} mb={2}>
          <Text fontWeight={600} fontSize="lg" color="gray.800">
            {title}
          </Text>
          {badges.map((badge, index) => (
            <Badge
              key={index}
              colorScheme={badge.color}
              variant="subtle"
              rounded="full"
              px={2}
            >
              {badge.text}
            </Badge>
          ))}
        </HStack>
        <Text color="gray.600">{text}</Text>
      </Box>
    </Stack>
  );
};

const messages = [
  { sender: "Alice", message: "Hey, how are you?", time: "10:02 AM" },
  { sender: "You", message: "I'm good! Working on the project.", time: "10:05 AM" },
  { sender: "Bob", message: "Nice! Need any help?", time: "10:07 AM" },
];

export default function ChatAppLanding() {
  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="7xl" pt={10}>
        <Stack align="center" spacing={{ base: 8, md: 10 }} py={{ base: 20, md: 28 }} direction={{ base: "column", md: "row" }}>
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading lineHeight={1.1} fontWeight={600} fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }} color="gray.800">
              <Text as="span" position="relative" _after={{ content: "''", width: "full", height: "30%", position: "absolute", bottom: 1, left: 0, bg: "blue.100", zIndex: -1 }}>
                ChatApp
              </Text>
            </Heading>
            <Text color="gray.600" fontSize="xl">
              Connect, chat, and collaborate with your team instantly. Stay in touch anywhere, anytime with our seamless messaging experience.
            </Text>
            <Stack spacing={4} direction={{ base: "column", sm: "row" }}>
              <Button as={RouterLink} to="/register" rounded="full" size="lg" px={8} colorScheme="blue" bg="blue.500" _hover={{ bg: "blue.600" }} leftIcon={<FiUserPlus />}>Get Started</Button>
              <Button as={RouterLink} to="/login" rounded="full" size="lg" px={8} variant="outline" colorScheme="blue" leftIcon={<FiLogIn />}>Sign In</Button>
            </Stack>
          </Stack>
          <Flex flex={1} justify="center" align="center" position="relative" w="full">
            <Box position="relative" height="500px" rounded="2xl" boxShadow="md" width="full" overflow="hidden" bg="white" border="1px" borderColor="gray.200">
              <Box bg="blue.500" p={4} color="white" borderBottom="1px solid" borderColor="blue.600">
                <HStack justify="space-between">
                  <HStack>
                    <Icon as={FiUsers} />
                    <Text fontWeight="bold">Chat Room</Text>
                  </HStack>
                  <Badge colorScheme="green">3 Online</Badge>
                </HStack>
              </Box>
              <VStack p={3} align="start" spacing={1} overflowY="auto" h="300px" bg="white">
                {messages.map((msg, index) => (
                  <Box key={index} alignSelf={msg.sender === "You" ? "flex-end" : "flex-start"} bg={msg.sender === "You" ? "blue.100" : "gray.100"} px={4} py={2} borderRadius="lg">
                    <Text fontWeight="bold" color="gray.800">{msg.sender}</Text>
                    <Text color="gray.700">{msg.message}</Text>
                    <Text fontSize="xs" color="gray.500">{msg.time}</Text>
                  </Box>
                ))}
                <Text fontSize="sm" color="gray.500">Alice is typing...</Text>
              </VStack>
            </Box>
          </Flex>
        </Stack>
        <Box py={20}>
          <VStack spacing={2} textAlign="center" mb={12}>
            <Heading fontSize="4xl" color="gray.800">Powerful Features</Heading>
            <Text fontSize="lg" color="gray.600">Everything you need for seamless team collaboration</Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} px={{ base: 4, md: 8 }}>
            <Feature icon={<Icon as={FiLock} w={10} h={10} />} title="Secure Authentication" badges={[{ text: "Secure", color: "green" }]} text="Login securely with encrypted passwords." />
            <Feature icon={<Icon as={FiUsers} w={10} h={10} />} title="Group Chats" badges={[{ text: "Real-time", color: "blue" }]} text="Stay connected with group messaging." />
            <Feature icon={<Icon as={FiUserCheck} w={10} h={10} />} title="Online Presence" badges={[{ text: "Live", color: "green" }]} text="See who's online in real-time." />
            <Feature icon={<Icon as={FiType} w={10} h={10} />} title="Typing Indicator" text="Know when someone is typing a message." />
            <Feature icon={<Icon as={FiGlobe} w={10} h={10} />} title="Global Access" text="Connect with anyone worldwide." />
            <Feature icon={<Icon as={FiLogOut} w={10} h={10} />} title="Join & Leave Groups" text="Easily join or leave group chats." />
          </SimpleGrid>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}