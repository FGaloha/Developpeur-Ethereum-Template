import { RegisteredList } from "../components/Lists/RegisteredList";
import { Heading, Flex } from '@chakra-ui/react';
import { useAccount } from 'wagmi'

export default function Registered() {

  const { isConnected } = useAccount()

  return (
    isConnected &&
    <Flex direction="column" alignItems="center" w="100%">
      <Heading as='h1' size='xl' noOfLines={1}>
        List of registered voters
      </Heading>
      <RegisteredList />
    </Flex>
  )
}
