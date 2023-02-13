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
import axios from 'axios'

export default function mintCollection() {

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
  const [price, setPrice] = useState(null)
  const [maxSupply, setMaxSupply] = useState(null)
  const [remainingSupply, setRemainingSupply] = useState(null)

  const [mintedNFT, setMintedNFT] = useState(null)

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
      const mintCollection = await contract.mint(quantity, { value: ethers.utils.parseEther(price) })
      await mintCollection.wait()
      console.log(contractAddressCollection)
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

  // To get infos of the collection
  const getCollection = async () => {
    const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider)
    const price = await contract.getPrice();
    const maxSupply = await contract.getMaxSupply();
    const currentSupply = await contract.totalSupply();

    const tokenId = 1
    const rawUri = await contract.tokenURI(tokenId)
    const Uri = Promise.resolve(rawUri)
    const getUri = Uri.then(value => {
      let str = value
      let cleanUri = str.replace('ipfs://', 'https://ipfs.io/ipfs/')
      let metadata = axios.get(cleanUri).catch(function (error) {
        console.log(error.toJSON());
      });
      return metadata;
    })
    getUri.then(value => {
      let rawImg = value.data.image
      let name = value.data.name
      let desc = value.data.description
      let image = rawImg.replace('ipfs://', 'https://ipfs.io/ipfs/')
      let attributes = value.data.attributes
      console.log(name)
      console.log(desc)
      console.log(image)
      console.log(attributes)
    })

    // let meta = {
    //   //name: name,
    //   img: image,
    //   tokenId: tokenId,
    //   //wallet: ownerW,
    //   desc,
    // }
    // console.log(meta)
    // console.log(meta.image)
    //let data = await axios.get(tokenUri)
    // let meta = data.data
    // setMintedNFT(meta.image)
    // console.log(meta.image)

    //    setMintedNFT(meta.image)

    setPrice(ethers.utils.formatEther(price).toString())
    setMaxSupply(maxSupply.toString())
    const remainingSupply = maxSupply.sub(currentSupply)
    setRemainingSupply(remainingSupply.toString())
  }

  return (
    //isConnected &&
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black'>
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

          <Flex spacing={4} w="30%" mt="10" alignItems="center">
            <NumberInput onChange={(quantityString) => setQuantity(quantityString)} step={1} defaultValue={1} min={1} max={50} focusBorderColor='pink.600'>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper bg='purple.200' />
                <NumberDecrementStepper bg='purple.200' />
              </NumberInputStepper>
            </NumberInput>
            <Button ms="4" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => mint()}>Mint</Button>
          </Flex>
        </Flex>) : <Text fontSize='3xl' mt="10">Please connect</Text>}
    </Flex>
  )
}
