import { Heading, Flex, Button, useToast, Text, Input } from '@chakra-ui/react';
import { useAccount, useSigner } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractMarket from "../../contracts/Market";
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'

export default function List() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()

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

  // List a NFT
  const updateSalePrice = async () => {
    setIsLoading(true);
    try {
      const contractMarket = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      const updatePrice = await contractMarket.updateSalePrice(ethers.utils.parseEther(price), contractAddressCollection, tokenId);
      await updatePrice.wait()
      toast({
        title: 'NFT(s) updated',
        description: `You successfully updated your NFT with new price ${price}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The price update of your NFT failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
    router.push('./wallet')
  }


  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Update NFT #{parseInt(tokenId) + 1} price
          </Heading>

          <Flex spacing={4} w="30%" mt="10" alignItems="center">
            <Input placeholder='Price in ETH - minimum 0,002' focusBorderColor='pink.600' onChange={e => setPrice(e.target.value)} />
            <Button ms="4" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => updateSalePrice()}>Update</Button>
          </Flex>
        </Flex>) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
