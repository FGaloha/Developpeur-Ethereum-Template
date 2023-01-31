import { Flex, Text, useToast, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import Contract from '../../contract/Voting';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const VotersList = () => {

  //WAGMI
  const { isConnected } = useAccount()
  const provider = useProvider()

  //CHAKRA-UI
  const toast = useToast()

  // STATES
  const { voters, setVoters, contractAddress } = useMembersProvider()

  useEffect(() => {
    if (isConnected) {
      getVoters()
    }
  }, [isConnected])

  // List of people who have already voted
  const getVoters = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)

    // Development
    // const votingEvents = await contract.queryFilter('Voted', 0, 'latest')

    // Production: to get events by 3000 blocks from contract block number  8405203
    let votingEvents = [];
    const startBlock = 8405203;
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('Voted', _startBlock, _endBlock);
      votingEvents = [...votingEvents, ...data]
    }

    let votingList = []
    votingEvents.forEach(votingEvent => {
      votingList.push([votingEvent.args.proposalId.toString(), votingEvent.args.voter])
    })
    setVoters(votingList)
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
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text></Text>)}
    </Flex>
  )
}
