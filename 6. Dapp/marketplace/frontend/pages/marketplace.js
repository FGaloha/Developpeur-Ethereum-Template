import { Heading, Flex } from '@chakra-ui/react';
import { useAccount } from 'wagmi'

export default function Marketplace() {

  // Wagmi
  // const { isConnected } = useAccount()

  return (
    //isConnected &&
    <Flex direction="column" alignItems="center" w="100%">
      <Heading as='h1' size='xl' noOfLines={1} color="black">
        Collections
      </Heading>
    </Flex>
  )
}
