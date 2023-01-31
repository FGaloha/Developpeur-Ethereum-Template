import {
  Heading, Flex, Thead, Table,
  Tbody, Tr, Th, Td, TableContainer
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const ResultsDetailed = () => {

  // Wagmi
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  // Context
  const { proposals, setProposals, contractAddress, winningProposal, setWinningProposal, isMember } = useMembersProvider()

  useEffect(() => {
    if (isMember) {
      getResults()
    }
  }, [isConnected, address])

  // Detailed results for each proposal
  const getResults = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)

    // Developement
    // const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 0, 'latest')

    // Production: to get events by 3000 blocks from contract block number  8405203
    let registeredProposalsEvents = [];
    const startBlock = 8405203;
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('ProposalRegistered', _startBlock, _endBlock);
      registeredProposalsEvents = [...registeredProposalsEvents, ...data]
    }

    let registeredList = []
    for await (const registeredProposalsEvent of registeredProposalsEvents) {
      const registeredProposal = await contract.connect(address).getOneProposal(registeredProposalsEvent.args.proposalId)
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
