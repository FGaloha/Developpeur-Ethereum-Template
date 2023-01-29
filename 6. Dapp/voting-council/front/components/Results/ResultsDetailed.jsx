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

    const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
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
    <>
      <Heading>Winning proposal: {winningProposal}</Heading>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Index</Th>
              <Th>Number of votes</Th>
              <Th>Winning proposal</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Proposal number</Td>
              <Td>Number of votes</Td>
              <Td>Description</Td>
            </Tr>
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
    </>
  )
}
