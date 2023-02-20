import {
  Heading, Flex, NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper, Button, useToast, Text,
  Card, CardHeader, CardBody, Box, Stack, StackDivider
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import { ethers } from 'ethers'

export default function Mint() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // Router
  const router = useRouter();
  const query = router.query;
  const contractAddressCollection = query.address;

  // Chakra
  const toast = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const [maxSupply, setMaxSupply] = useState(null)
  const [remainingSupply, setRemainingSupply] = useState(null)

  useEffect(() => {
    if (isConnected) {
      getCollection();
    }
  }, [isConnected])

  // Mint a new NFT of the collection
  const mint = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, signer)
      const totalPrice = price * quantity
      const mintCollection = await contract.mint(quantity, { value: ethers.utils.parseEther(totalPrice.toString()) })
      await mintCollection.wait()
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
    router.push('../marketplace/wallet')
  }

  // To get infos of the collection
  const getCollection = async () => {
    const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider)
    const price = await contract.getPrice();
    const maxSupply = await contract.getMaxSupply();
    const currentSupply = await contract.totalSupply();
    setPrice(ethers.utils.formatEther(price).toString())
    setMaxSupply(maxSupply.toString())
    const remainingSupply = maxSupply.sub(currentSupply)
    setRemainingSupply(remainingSupply.toString())
  }

  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Mint NFT
          </Heading>

          <Card w="30%">
            <CardHeader>
              <Heading size='md'>Collection mint status</Heading>
            </CardHeader>

            <CardBody>
              <Stack divider={<StackDivider />} spacing='4'>
                <Box>
                  <Heading size='xs' textTransform='uppercase'>
                    Price
                  </Heading>
                  <Text pt='2' fontSize='sm'>
                    {price} ETH
                  </Text>
                </Box>
                <Box>
                  <Heading size='xs' textTransform='uppercase'>
                    Maximum supply
                  </Heading>
                  <Text pt='2' fontSize='sm'>
                    {maxSupply}
                  </Text>
                </Box>
                <Box>
                  <Heading size='xs' textTransform='uppercase'>
                    Remaining supply
                  </Heading>
                  <Text pt='2' fontSize='sm'>
                    {remainingSupply}
                  </Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
          {remainingSupply > 0 ? (
            <Flex spacing={4} w="30%" mt="10" alignItems="center">
              <NumberInput onChange={(quantityString) => setQuantity(quantityString)} step={1} defaultValue={1} min={1} max={remainingSupply} focusBorderColor='pink.600'>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper bg='purple.200' />
                  <NumberDecrementStepper bg='purple.200' />
                </NumberInputStepper>
              </NumberInput>
              <Button ms="4" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => mint()}>Mint</Button>
            </Flex>) : (<Text fontSize='3xl' mt="10">Sold out</Text>)}
        </Flex>) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
