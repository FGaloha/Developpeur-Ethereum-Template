import {
  Heading, Flex, Input, Stack, Button, useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider, useBalance } from 'wagmi'
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
  const { data } = useBalance({
    address: address,
    watch: true
  })

  // Context
  const { contractAddressFactory, blockNumberFactory } = useMembersProvider()

  // Chakra
  const toast = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [maxSupply, setMaxSupply] = useState(1)
  const [price, setPrice] = useState("")
  const [baseURI, setBaseURI] = useState("")
  const [collections, setCollections] = useState([])

  useEffect(() => {
    if (isConnected) {
      getCollections();
    }
  }, [isConnected, address])

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
  }

  // To add a collection
  const addCollection = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, signer);
      console.log(contractAddressFactory);
      const collectionCreation = await contract.createNFTCollection(maxSupply, ethers.utils.parseEther(price), baseURI);
      await collectionCreation.wait();
      getCollections();
      setMaxSupply(1);
      setPrice("");
      setBaseURI("");
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
    isConnected && (
      < Flex direction='column' alignItems='center' w='100%' backgroundColor='black' rounded='xl'>
        <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='100'>
          Create a new collection
        </Heading>
        <Stack spacing={4} w="30%">

          <NumberInput value={maxSupply} onChange={(maxSupplyString) => setMaxSupply(maxSupplyString)} step={1} defaultValue={1} min={1} focusBorderColor='pink.600'>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper bg='purple.200' />
              <NumberDecrementStepper bg='purple.200' />
            </NumberInputStepper>
          </NumberInput>

          <Input placeholder='Price per NFT' value={price} focusBorderColor='pink.600' onChange={e => setPrice(e.target.value)} />

          <Input placeholder='Base URI ipfs://CID/' value={baseURI} focusBorderColor='pink.600' onChange={e => setBaseURI(e.target.value)} />

          <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => addCollection()}>Add</Button>

        </Stack>
        <SubsidiaryCollections collections={collections} />
      </Flex >)
  )
}
