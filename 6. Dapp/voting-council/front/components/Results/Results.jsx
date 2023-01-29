import {
  Heading, Flex, Text, Textarea, Input, Button, useToast, Thead, Table,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const Results = () => {

  // Smart Contract address
  // const env = process.env.NODE_ENV
  // const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  //WAGMI
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  //CHAKRA-UI
  const toast = useToast()

  // STATES
  const { proposals, contractAddress, isMember, winningProposal, setWinningProposal } = useMembersProvider()


  useEffect(() => {
    // if (isMember) {
    getResults()
    // }
  }, [isConnected, address])

  // List of people who have already voted
  const getResults = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const winningId = await contract.winningProposalID()
    //const proposalCount = await contract.getOneProposal(winningId)
    //let winningResult = [winningId.toString(), proposalCount.description, proposalCount.voteCount.toString()]
    // proposals.forEach(proposal => {
    //   if (proposal[0] == winningId) {
    //     winningResult.push([winningId, proposal[1]])
    //   }
    // })
    setWinningProposal([winningId.toString()])
    console.log("address appel gagnant")
    console.log(address)
    console.log(winningProposal)
    console.log(proposals)
  }

  return (
    <>
      <Heading>Winning proposal: {winningProposal[0]}</Heading>
    </>
  )
}
