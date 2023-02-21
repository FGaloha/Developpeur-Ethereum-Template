import { Heading, Flex, Button, useToast, Text, Input } from '@chakra-ui/react';
import { useAccount, useSigner } from 'wagmi'
import { useState } from 'react'
import { useRouter } from "next/router";
import ContractFactory from "../../contracts/Factory";
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export default function UpdateSubsidiary() {

  // Wagmi
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()

  // Router
  const router = useRouter();
  const query = router.query;
  const addressSubsidiary = query.subsidiary;

  // Chakra
  const toast = useToast()

  // Context
  const { contractAddressFactory } = useMembersProvider()

  // State
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [name, setName] = useState(null)
  const [symbol, setSymbol] = useState(null)

  // Update subsidiary name & symbol
  const updateSubsidiary = async () => {
    setIsLoadingUpdate(true);
    try {
      const contractFactory = new ethers.Contract(contractAddressFactory, ContractFactory.abi, signer)
      const update = await contractFactory.updateSubsidiary(addressSubsidiary, name, symbol);
      await update.wait()
      toast({
        title: 'Subsidiary updated',
        description: `You successfully updated the subsidiary`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The subsidiary update failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoadingUpdate(false);
    router.push('../admin')
  }


  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Update Subsidiary
          </Heading>
          <Text>Address: {addressSubsidiary}</Text>

          <Flex direction="column" w="30%" mt="10" alignItems="center">
            <Input m="2" placeholder='Subsidiary name' focusBorderColor='pink.600' onChange={e => setName(e.target.value)} />
            <Input m="2" placeholder='Subsidiary symbol' focusBorderColor='pink.600' onChange={e => setSymbol(e.target.value)} />
            <Button ms="2" mt="2" isLoading={isLoadingUpdate ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => updateSubsidiary()}>Update</Button>
          </Flex>
        </Flex>) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
