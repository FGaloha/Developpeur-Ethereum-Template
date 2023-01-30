import { Flex, Text } from '@chakra-ui/react'

export const Footer = () => {
  return (
    <Flex h="8vh" p="2rem" justifyContent="center" alignItems="center" border="2px">
      <Text>Voting &copy;High Jedi Council {new Date().getFullYear()}</Text>
    </Flex>
  )
}
