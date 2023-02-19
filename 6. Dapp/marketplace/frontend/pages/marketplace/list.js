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
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // Router
  const router = useRouter();
  const query = router.query;
  const contractAddressCollection = query.address;
  const tokenId = query.tokenId;

  // Chakra
  const toast = useToast()

  // Context
  const { contractAddressMarket } = useMembersProvider()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [price, setPrice] = useState(null)

  useEffect(() => {
    if (isConnected) {
      //setApprovalStatus();
    }
  }, [isConnected])

  // Get Market approval status on the tokens of the collection owned by the connected address
  const setApprovalStatus = async () => {
    const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider)
    const isApprovedStatus = await contract.isApprovedForAll(address, contractAddressMarket)
    setIsApproved(isApprovedStatus)
    console.log(isApproved)
  }

  // List a NFT
  const addToSale = async () => {
    setIsLoading(true);
    try {
      // Approve marketplace to manage sales of the token
      const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, signer)
      // const setApprovalCollection = await contract.setApprovalForAll(contractAddressMarket, true);
      // await setApprovalCollection.wait()
      const approve = await contract.approve(contractAddressMarket, tokenId);
      await approve.wait()

      // Put NFT on Sale
      const contractMarket = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      // // const addToSale = await contractMarket.getMinimalPrice();
      const addToSale = await contractMarket.addToSale(contractAddressCollection, tokenId, ethers.utils.parseEther(price));
      await addToSale.wait()
      //console.log(addToSale.toString())

      toast({
        title: 'NFT(s) listed',
        description: `You successfully listed NFT ${tokenId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The listing failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
    router.push('./wallet')
  }

  // To get infos of the collection
  // const getCollection = async () => {
  //   const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider)
  //   const price = await contract.getPrice();
  //   const maxSupply = await contract.getMaxSupply();
  //   const currentSupply = await contract.totalSupply();
  //   setPrice(ethers.utils.formatEther(price).toString())
  //   setMaxSupply(maxSupply.toString())
  //   const remainingSupply = maxSupply.sub(currentSupply)
  //   setRemainingSupply(remainingSupply.toString())
  // }

  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            List NFT {parseInt(tokenId) + 1}
          </Heading>



          <Flex spacing={4} w="30%" mt="10" alignItems="center">
            <Input placeholder='Price in ETH' focusBorderColor='pink.600' onChange={e => setPrice(e.target.value)} />
            <Button ms="4" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => addToSale()}>List</Button>
          </Flex>
        </Flex>) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
