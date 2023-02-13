import { Heading, Flex, Input, Stack, Button, useToast, Text } from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useState, useEffect } from "react";
import useMembersProvider from '@/hooks/useMembersProvider'
import ContractFactory from "../contracts/Factory";
import { ethers } from 'ethers'
import { SubsidiaryCollections } from '@/components/Lists/SubsidiaryCollections';

export default function Subsidiary() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // Context
  const { isSubsidiary, contractAddressFactory } = useMembersProvider()

  // Chakra
  const toast = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [maxSupply, setMaxSupply] = useState(null)
  const [price, setPrice] = useState(null)
  const [baseURI, setBaseURI] = useState(null)

  useEffect(() => {
    // getSubsidiaries()
  }, [isConnected, address])

  // To add a collection
  const addCollection = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, signer)
      console.log(contractAddressFactory)
      const collectionCreation = await contract.createNFTCollection(maxSupply, ethers.utils.parseEther(price), baseURI)
      await collectionCreation.wait()
      toast({
        title: 'Collection added',
        description: `You successfully added a new collection`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The collection creation failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    isConnected && isSubsidiary && (
      < Flex direction='column' alignItems='center' w='100%' backgroundColor='black'>
        <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='100'>
          Create a new collection
        </Heading>
        <Stack spacing={4} w="30%">

          <Input placeholder='Max supply' focusBorderColor='pink.600' onChange={e => setMaxSupply(e.target.value)} />

          <Input placeholder='Price per NFT' focusBorderColor='pink.600' onChange={e => setPrice(e.target.value)} />

          <Input placeholder='Base URI ipfs://CID/' focusBorderColor='pink.600' onChange={e => setBaseURI(e.target.value)} />

          <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => addCollection()}>Add</Button>

        </Stack>
        <SubsidiaryCollections />
      </Flex >)
  )
}
