import { VotersList } from "../components/Lists/VotersList";
import { Box, Heading, Flex } from '@chakra-ui/react';
import { useAccount } from 'wagmi'

export default function Voters() {

  // Wagmi
  const { isConnected } = useAccount()

  return (
    isConnected &&
    <Flex direction="column" alignItems="center" w="100%">
      <Heading as='h1' size='xl' noOfLines={1}>
        List of people who already voted
      </Heading>
      <VotersList />
    </Flex>
  )
}
