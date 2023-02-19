import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useAccount, useProvider } from 'wagmi'
import ContractFactory from '../../contracts/Factory';
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'
import Link from 'next/link'

export const SubsidiaryCollections = () => {

  // Wagmi
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  // Context
  const { collections, setCollections, contractAddressFactory } = useMembersProvider()

  useEffect(() => {
    if (isConnected) {
      getCollections();
    }
  }, [isConnected])

  // To get existing collections owned by the subsidiary connected
  const getCollections = async () => {
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

    let createdCollectionsEvents = [];
    const startBlock = blockNumberFactory; // block number of the contract Factory
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('CollectionCreated', _startBlock, _endBlock);
      createdCollectionsEvents = [...createdCollectionsEvents, ...data]
    }

    //Filter to get only collections of the subsidiary
    let subsidiaryCollections = [];
    for (let i = 0; i < createdCollectionsEvents.length; i++) {
      if (createdCollectionsEvents[i].args[3] == address) {
        subsidiaryCollections.push([createdCollectionsEvents[i].args[0], createdCollectionsEvents[i].args[1], createdCollectionsEvents[i].args[2], createdCollectionsEvents[i].args[3]]);
      }
    }
    setCollections(subsidiaryCollections)
    console.log(subsidiaryCollections)
  }

  return (
    <Flex bg="black">
      {collections.length > 0 ? (
        <TableContainer my='20'>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Collection name</Th>
                <Th>Collection address</Th>
                <Th>Creation date</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {collections.slice(0).reverse().map(collection => (
                <Tr key={collections.indexOf(collection)}>
                  <Td>{collections.indexOf(collection) + 1}</Td>
                  <Td>{collection[0]}</Td>
                  <Td>{collection[1].substring(0, 5)}...{collection[1].substring(collection[1].length - 4)}</Td>
                  <Td>{new Intl.DateTimeFormat('fr-FR').format(collection[2] * 1000)}</Td>
                  <Td><Link href={{
                    pathname: '/collection/update',
                    query: collection[1],
                  }}>Edit</Link></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text my="20" fontSize="3xl">No collection for the moment</Text>)}
    </Flex>
  )
}
