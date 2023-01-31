import { Heading, Flex, useToast } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const Results = () => {

  // Wagmi
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  // Chakra
  const toast = useToast()

  // Context
  const { contractAddress, winningProposal, setWinningProposal } = useMembersProvider()


  useEffect(() => {
    getResults()
  }, [isConnected, address])

  // To get the list of people who have already voted
  const getResults = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const winningId = await contract.winningProposalID()
    setWinningProposal([winningId.toString()])
  }

  return (
    <Flex mt="5" bg="#25D366" color="black" alignItems="center" justifyContent="center" width="40%">
      <Heading width="100%" p="100">Winning proposal: {winningProposal[0]}</Heading>
    </Flex>
  )
}
