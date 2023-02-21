import { Flex, Text, Thead, Table, Tbody, Tr, Th, Td, TableContainer, Button, useToast } from '@chakra-ui/react'
import { useSigner } from 'wagmi'
import { useState } from "react";
import { useRouter } from "next/router";
import useMembersProvider from '@/hooks/useMembersProvider'
import ContractFactory from "../../contracts/Factory";
import { ethers } from 'ethers'

export const Subsidiaries = ({ subsidiaries, getSubsidiaries }) => {

  // Wagmi
  const { data: signer } = useSigner()

  // Router
  const router = useRouter();

  // Context
  const { contractAddressFactory } = useMembersProvider()

  // State
  const [isLoadingDeactivate, setIsLoadingDeactivate] = useState(false)

  // Chakra
  const toast = useToast()

  // Deactivate a subsidiaries from using the Factory
  const deactivateSubsidiary = async (subsidiaryAddress) => {
    setIsLoadingDeactivate(true);
    try {
      const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, signer);
      const deactivate = await contract.deactivateSubsidiary(subsidiaryAddress);
      await deactivate.wait()
      getSubsidiaries();
      toast({
        title: 'Subsidiary deactivated',
        description: `You successfully deactivated the subsidiary`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The deactivation failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoadingDeactivate(false);
  }

  return (
    <Flex bg="black" my="10">
      {subsidiaries.length > 0 ? (
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>Subsidiary order</Th>
                <Th>Subsidiary address</Th>
                <Th>Subsidiary name</Th>
                <Th>Subsidiary symbol</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {subsidiaries.slice(0).reverse().map(subsidiary => (
                <Tr key={subsidiaries.indexOf(subsidiary)}>
                  <Td>{subsidiaries.indexOf(subsidiary) + 1}</Td>
                  <Td>{subsidiary.args[0].substring(0, 5)}...{subsidiary.args[0].substring(subsidiary.args[0].length - 4)}</Td>
                  <Td>{subsidiary.args[1]}</Td>
                  <Td>{subsidiary.args[2]}</Td>
                  <Td>
                    <Button colorScheme='purple' onClick={() => router.push(`../../factory/update/?subsidiary=${subsidiary.args[0]}`)}>
                      Update
                    </Button>
                    <Button ms="2" isLoading={isLoadingDeactivate ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => deactivateSubsidiary(subsidiary.args[0])}>
                      Deactivate
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (<Text mt="10" fontSize="3xl">No subsidiary for the moment</Text>)}
    </Flex>
  )
}
