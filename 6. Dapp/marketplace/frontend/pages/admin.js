import { Heading, Flex, Input, Stack, Button, useToast } from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useState, useEffect } from "react";
import useMembersProvider from '@/hooks/useMembersProvider'
import ContractFactory from "../contracts/Factory";
import { ethers } from 'ethers'
import { Subsidiaries } from '@/components/Lists/Subsidiaries';

export default function Admin() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // Context
  const { ownerFactory, contractAddressFactory } = useMembersProvider()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(null)
  const [symbol, setSymbol] = useState(null)
  const [addressSeller, setAddressSeller] = useState(null)

  // Chakra
  const toast = useToast()

  useEffect(() => {
  }, [isConnected, address])

  // To add a subsidiary
  const addSubsidiary = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, signer)
      const subsidiaryCreation = await contract.setSubsidiary(addressSeller, name, symbol)
      await subsidiaryCreation.wait()
      toast({
        title: 'Subsidiary added',
        description: `You successfully added subsidiary ${name}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The subsidiary creation of ${name} failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    isConnected && ownerFactory && (
      < Flex direction='column' alignItems='center' w='100%' backgroundColor='black' rounded='xl'>
        <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='100'>
          Create a subsidiary
        </Heading>
        <Stack spacing={4} w="30%">

          <Input placeholder='Name' focusBorderColor='pink.600' onChange={e => setName(e.target.value)} />

          <Input placeholder='Symbol' focusBorderColor='pink.600' onChange={e => setSymbol(e.target.value)} />

          <Input placeholder='Seller Address 0x12A...B21' focusBorderColor='pink.600' onChange={e => setAddressSeller(e.target.value)} />

          <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => addSubsidiary()}>Add</Button>

        </Stack>
        <Subsidiaries />
      </Flex >)
  )
}
