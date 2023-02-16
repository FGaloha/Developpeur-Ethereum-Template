import { Flex, Text } from '@chakra-ui/react'

export const Footer = () => {
  return (
    <Flex h="8vh" p="2rem" justifyContent="center" alignItems="center" border="2px">
      <Text color='purple.700'>Oneiroi &copy;Morpheus {new Date().getFullYear()}</Text>
    </Flex>
  )
}
