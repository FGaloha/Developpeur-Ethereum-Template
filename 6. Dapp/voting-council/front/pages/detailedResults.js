import { ResultsDetailed } from '@/components/Results/ResultsDetailed';
import { Heading, Flex } from '@chakra-ui/react';
import { useAccount } from 'wagmi'

export default function Voters() {

  // Wagmi
  const { isConnected } = useAccount()

  return (
    isConnected &&
    <Flex direction="column" alignItems="center" w="100%">
      <Heading as='h1' size='xl' noOfLines={1}>
        Detailed results for members
      </Heading>
      <ResultsDetailed />
    </Flex>
  )
}
