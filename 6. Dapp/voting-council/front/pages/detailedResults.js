import { ResultsDetailed } from '@/components/Results/ResultsDetailed';
import { Box, Heading, Flex, Text, Textarea, Input, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useAccount } from 'wagmi'

export default function Voters() {

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
