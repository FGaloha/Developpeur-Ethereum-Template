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

export const VotersList = () => {

  // Smart Contract address
  // const env = process.env.NODE_ENV
  // const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  //WAGMI
  const { isConnected } = useAccount()
  const provider = useProvider()

  //CHAKRA-UI
  const toast = useToast()

  // STATES
  const { voters, setVoters, contractAddress } = useMembersProvider()
  // const [voters, setVoters] = useState([])

  useEffect(() => {
    if (isConnected) {
      getVoters()
    }
  }, [isConnected])

  // List of people who have already voted
  const getVoters = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const votingEvents = await contract.queryFilter('Voted', 0, 'latest')
    let votingList = []
    votingEvents.forEach(votingEvent => {
      votingList.push([votingEvent.args.proposalId.toString(), votingEvent.args.voter])
    })
    setVoters(votingList)
    console.log(votingList)
  }

  return (
    <Flex bg="black">
      {voters.length > 0 ? (
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Vote order</Th>
                <Th>Voter address</Th>
                <Th>Vote for proposal</Th>
              </Tr>
            </Thead>
            <Tbody>
              {voters.slice(0).reverse().map(voter => (
                <Tr key={voters.indexOf(voter)}>
                  <Td>{voters.indexOf(voter) + 1}</Td>
                  <Td>{voter[1].substring(0, 5)}...{voter[1].substring(voter[1].length - 4)}</Td>
                  <Td>{voter[0]}</Td>
                  {/* <Td>{voter.voter.substring(0, 5)}...{voter.voter.substring(voter.voter.length - 4)}</Td>
                  <Td>{voter.proposalId}</Td> */}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text></Text>)}
    </Flex>
  )
}
