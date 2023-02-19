import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import ContractFactory from '../../contracts/Factory';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export const Subsidiaries = () => {

  // Wagmi
  const { isConnected } = useAccount()
  const provider = useProvider()

  // Context
  const { subsidiaries, setSubsidiaries, contractAddressFactory, blockNumberFactory } = useMembersProvider()

  useEffect(() => {
    if (isConnected) {
      getSubsidiaries();
    }
  }, [isConnected])

  // To get existing subsidiaries
  const getSubsidiaries = async () => {
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

    let registeredSubsidiariesEvents = [];
    const startBlock = blockNumberFactory; // block number of the contract Factory
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('SubsidiaryAdded', _startBlock, _endBlock);
      registeredSubsidiariesEvents = [...registeredSubsidiariesEvents, ...data]
    }
    setSubsidiaries(registeredSubsidiariesEvents)
    //console.log(subsidiaries[0].address)
  }

  return (
    <Flex bg="black">
      {subsidiaries.length > 0 ? (
        <TableContainer mt='20'>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Subsidiary order</Th>
                <Th>Subsidiary address</Th>
                <Th>Subsidiary name</Th>
                <Th>Subsidiary symbol</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subsidiaries.slice(0).reverse().map(subsidiary => (
                <Tr key={subsidiaries.indexOf(subsidiary)}>
                  <Td>{subsidiaries.indexOf(subsidiary) + 1}</Td>
                  <Td>{subsidiary.args[0].substring(0, 5)}...{subsidiary.args[0].substring(subsidiary.args[0].length - 4)}</Td>
                  <Td>{subsidiary.args[1]}</Td>
                  <Td>{subsidiary.args[2]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text mt="20" fontSize="3xl">No subsidiary for the moment</Text>)}
    </Flex>
  )
}
