import { Heading, Flex, Text, Button, useToast } from '@chakra-ui/react';
import { useAccount, useSigner, useProvider, useBalance } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import { ethers } from 'ethers'
import ContractCollection from "../../contracts/Collection";

export default function updateCollection() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const { data } = useBalance({
    address: address,
    watch: true
  })

  // Chakra
  const toast = useToast()

  // Router
  const router = useRouter();
  const query = router.query;
  const contractAddressCollection = query.address;

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingWithdraw, setIsLoadingWithdraw] = useState(false)
  const [price, setPrice] = useState(null)
  const [maxSupply, setMaxSupply] = useState(null)
  const [totalSupply, setTotalSupply] = useState(null)
  const [baseURI, setBaseURI] = useState(null)
  const [earnings, setEarnings] = useState(0)

  useEffect(() => {
    if (isConnected) {
      getBalance();
      getCollection();
    }
  }, [isConnected, address])

  // Get collection balance
  const getBalance = async () => {
    const collectionBalance = await provider.getBalance(contractAddressCollection);
    setEarnings(ethers.utils.formatEther(collectionBalance));
  }

  // To get infos of the collection
  const getCollection = async () => {
    const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider)
    const priceCollect = await contract.getPrice();
    const maxSupply = await contract.getMaxSupply();
    const currentSupply = await contract.totalSupply();
    const baseURI = await contract.getBaseURI();

    const price = ethers.utils.formatEther(priceCollect).toString()
    setPrice(price)
    setMaxSupply(maxSupply.toString())
    setTotalSupply(currentSupply.toString())
    setBaseURI(baseURI.toString())
  }

  // Withdraw funds
  const withdraw = async () => {
    setIsLoadingWithdraw(true);
    try {
      const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, signer)
      const withdrawFunds = await contract.releaseAll()
      await withdrawFunds.wait()
      getBalance();
      toast({
        title: 'Funds withdrawed',
        description: `You successfully withdraw ${earnings}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The withdrawal of ${earnings} failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoadingWithdraw(false);

  }

  return (
    isConnected && (
      <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
        <Heading as='h1' noOfLines={1} color='white' mt='4' mb='10'>
          Update collection
        </Heading>
        <Flex direction="column" color="gray.500" w="100%" ms="10">
          <Text>Address: {contractAddressCollection}</Text>
          <Text>Max supply: {maxSupply}</Text>
          <Text>Mint price: {price} ETH</Text>
          <Text>Total supply: {totalSupply} - {Math.round(totalSupply / maxSupply * 100)}%</Text>
          <Text>Base URI: {baseURI} <Button ms="4" size='xs' colorScheme='purple' onClick={() => router.push(`./baseURI/?address=${contractAddressCollection}`)}>Update</Button></Text>
          <Text>Contract balance: {earnings} ETH
            {earnings > 0 && <Button ms="4" size='xs' isLoading={isLoadingWithdraw ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => withdraw()}>Withdraw</Button>}
          </Text>
        </Flex>
      </Flex>)
  )
}
