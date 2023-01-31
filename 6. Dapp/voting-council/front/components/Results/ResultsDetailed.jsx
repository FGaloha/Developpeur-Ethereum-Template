import {
  Heading, Flex, useToast, Thead, Table,
  Tbody, Tr, Th, Td, TableContainer
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const ResultsDetailed = () => {

  //WAGMI
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  //CHAKRA-UI
  const toast = useToast()

  // STATES
  const { proposals, setProposals, contractAddress, winningProposal, setWinningProposal, isMember } = useMembersProvider()

  useEffect(() => {
    if (isMember) {
      getResults()
    }
  }, [isConnected, address])

  // Results for each proposal
  const getResults = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 8405203, 'latest')
    let registeredList = []
    for await (const registeredProposalsEvent of registeredProposalsEvents) {
      const registeredProposal = await contract.getOneProposal(registeredProposalsEvent.args.proposalId)
      registeredList.push([registeredProposalsEvent.args.proposalId.toString(), registeredProposal.voteCount.toString(), registeredProposal.description])
    }
    setProposals(registeredList)

    const winningId = await contract.winningProposalID()
    setWinningProposal(winningId.toString())
  }

  return (
    <Flex bg="black" direction="column" px="10" py="5" justifyContent="center" alignItems="center">
      <Heading>Winning proposal: {winningProposal}</Heading>
      <TableContainer mt="3">
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Proposal number</Th>
              <Th>Number of votes</Th>
              <Th>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {proposals.slice(0).map(proposal => (
              <Tr key={proposals.indexOf(proposal)}>
                <Td>{proposal[0]}</Td>
                <Td>{proposal[1]}</Td>
                <Td>{proposal[2]}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  )
}
