import {
  Heading, Flex, NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper, Button, useToast, Text
} from '@chakra-ui/react';
import { useAccount, useSigner } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Factory";

export default function mintCollection() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()

  // Router
  const router = useRouter();
  const query = router.query;
  const contractAddressCollection = query.address;

  // Chakra
  const toast = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(null)

  useEffect(() => {
    if (isConnected) {
      // console.log(contractAddressCollection)
      //get collection info
    }
  }, [isConnected])

  // Mint a new NFT of the collection
  const mint = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, signer)
      const mintCollection = await contract.mint(1, { value: 0.1 })
      await mintCollection.wait()
      console.log(mintCollection)
      toast({
        title: 'NFT(s) minted',
        description: `You successfully mint ${quantity} NFT(s)`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The mint failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  // To update the collection
  // const updateCollection = async () => {
  //   const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

  //   let createdCollectionsEvents = [];
  //   const startBlock = 0; // block number of the contract Factory
  //   const endBlock = await provider.getBlockNumber();

  //   for (let i = startBlock; i < endBlock; i += 3000) {
  //     const _startBlock = i;
  //     const _endBlock = Math.min(endBlock, i + 2999);
  //     const data = await contract.queryFilter('CollectionCreated', _startBlock, _endBlock);
  //     createdCollectionsEvents = [...createdCollectionsEvents, ...data]
  //   }

  //   //Filter to get only collections of the subsidiary
  //   let subsidiaryCollections = [];
  //   for (let i = 0; i < createdCollectionsEvents.length; i++) {
  //     if (createdCollectionsEvents[i].args[3] == address) {
  //       subsidiaryCollections.push([createdCollectionsEvents[i].args[0], createdCollectionsEvents[i].args[1], createdCollectionsEvents[i].args[2], createdCollectionsEvents[i].args[3]]);
  //     }
  //   }
  //   setCollections(subsidiaryCollections)
  // }

  return (
    //isConnected &&
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='100'>
            Mint NFT
          </Heading>
          <Flex spacing={4} w="30%">
            <NumberInput onChange={(quantityString) => setQuantity(quantityString)} step={1} defaultValue={1} min={1} max={50} focusBorderColor='pink.600'>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => mint()}>Mint</Button>
          </Flex>
        </Flex>) : <Text fontSize='3xl' mt="10">Please connect</Text>}
    </Flex>
  )
}
