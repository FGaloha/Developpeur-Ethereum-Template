import {
  Heading, Flex, Text, Textarea, Input, Button, useToast, Thead, Table,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useAccount, useProvider, useSigner } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const ResultsDetailed = () => {

  // Smart Contract address
  // const env = process.env.NODE_ENV
  // const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  //WAGMI
  const { isConnected, address } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()

  //CHAKRA-UI
  const toast = useToast()

  // STATES
  const { proposals, setProposals, contractAddress, isMember, winningProposal, setWinningProposal } = useMembersProvider()

  useEffect(() => {
    // if (isMember) {
    getResults()
    // }
  }, [isConnected, address])

  // Results for each proposal
  const getResults = async () => {

    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const registeredProposalsEvents = await contract.queryFilter('ProposalRegistered', 0, 'latest')
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
