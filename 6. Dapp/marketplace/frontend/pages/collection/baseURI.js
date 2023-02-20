import {
  Heading, Flex, Button, useToast, Text,
  Input, Box, Stack, StackDivider
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import ContractMarket from "../../contracts/Market";
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export default function List() {

  // Wagmi
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()

  // Router
  const router = useRouter();
  const query = router.query;
  const contractAddressCollection = query.address;

  // Chakra
  const toast = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [baseURI, setBaseURI] = useState(null)

  useEffect(() => {
    if (isConnected) {
      //setApprovalStatus();
    }
  }, [isConnected])

  // Withdraw funds
  const updateBaseURI = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, signer)
      const newURI = await contract.setBaseURI(baseURI);
      await newURI.wait()
      toast({
        title: 'Collection updated',
        description: `You successfully updated the Base URI`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The collection update failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
    router.push(`./update?address=${contractAddressCollection}`)
  }


  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Update Collection
          </Heading>
          <Flex spacing={4} w="30%" mt="10" alignItems="center">
            <Input placeholder='Base URI ipfs://CID/' value={baseURI} focusBorderColor='pink.600' onChange={e => setBaseURI(e.target.value)} />
            <Button ms="4" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => updateBaseURI()}>Update</Button>
          </Flex>
        </Flex>) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
