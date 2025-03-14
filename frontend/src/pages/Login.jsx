import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      // Save the user
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      navigate("/chat");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred", // Fixed: Optional chaining
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box
      w="100%"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
    >
      <Box
        display="flex"
        w={["95%", "90%", "80%", "75%"]}
        maxW="1200px"
        h={["auto", "auto", "600px"]}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
      >
        {/* Left Panel - Hidden on mobile */}
        <Box display={["none", "none", "flex"]} w="50%" bg="gray.800" position="relative">
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.700"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={10}
            color="white"
          >
            <Text fontSize="4xl" fontWeight="bold" mb={4} color="teal.300">
              Join Our Chat Community
            </Text>
            <Text fontSize="lg" maxW="400px" color="gray.300" textAlign="center">
              Connect and collaborate with people from around the world in real-time.
            </Text>
          </Box>
        </Box>

        {/* Right Panel - Login Form */}
        <Box
          w={["100%", "100%", "50%"]} // Fixed: Removed extra comma
          bg="gray.700"
          p={[6, 8, 10]}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box display={["block", "block", "none"]} textAlign="center" mb={6}>
            <Box as={FiLogIn} mx="auto" fontSize="3rem" color="teal.300" mb={2} />
            <Text fontSize="2xl" fontWeight="bold" color="gray.300">
              Welcome Back
            </Text>
          </Box>

          <VStack spacing={6} w="100%" maxW="400px" mx="auto">
            <FormControl id="email" isRequired>
              <FormLabel color="gray.300" fontWeight="medium">Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter your email"
                size="lg"
                bg="gray.800"
                borderColor="gray.600"
                _hover={{ borderColor: "teal.400" }}
                _focus={{ borderColor: "teal.400" }}
                color="white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl id="password" isRequired>
              <FormLabel color="gray.300" fontWeight="medium">Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                size="lg"
                bg="gray.800"
                borderColor="gray.600"
                _hover={{ borderColor: "teal.400" }}
                _focus={{ borderColor: "teal.400" }}
                color="white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button
              onClick={handleSubmit}
              isLoading={loading}
              colorScheme="teal"
              width="100%"
              size="lg"
              fontSize="md"
              leftIcon={<FiLogIn />}
            >
              Sign In
            </Button>

            <Text color="gray.400">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "var(--chakra-colors-teal-400)",
                  fontWeight: "500",
                }}
              >
                Register now
              </Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
