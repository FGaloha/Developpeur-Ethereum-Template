import { Header } from "./Header";
import { Footer } from "./Footer";
import { Flex } from '@chakra-ui/react'

export const Layout = ({ children }) => {
  return (
    <Flex direction="column" minHeight="100vh" bg="black" color="purple.500">
      <Header />
      <Flex flexGrow="1" px="2rem" pb="2rem" pt="3rem" mt="20" bg="purple.500">
        {children}
      </Flex>
      <Footer />
    </Flex>
  )
}
