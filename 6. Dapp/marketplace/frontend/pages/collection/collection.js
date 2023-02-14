import {
  Heading, Flex, NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper, Image,
  NumberDecrementStepper, Button, ButtonGroup, useToast, Text, Divider,
  Card, CardHeader, CardBody, CardFooter, Box, Stack, StackDivider
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import { ethers } from 'ethers'
import axios from 'axios'

export default function Collection() {

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
  const [name, setName] = useState(null);
  const [nfts, setNfts] = useState([])
  const [nftLoaded, setNftLoaded] = useState(false)

  useEffect(() => {
    if (isConnected) {
      getCollection();
    }
  }, [isConnected])

  // Get NFTs of the collection on sale to show the button Buy /or Offer if time to implement
  const nftOnSale = async () => {
    //     const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, provider)
    // // [[tokenId,price], [tokenId,price]]
    // // [tokenId, tokenId...]
  }

  // Buy an NFT of the collection
  const buyNFT = async (tokenId, price) => {
    //   setIsLoading(true);
    //   try {
    //     const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
    //     const buy = await contract.buyItem(contractAddressCollection, tokenId, { value: ethers.utils.parseEther(price) })
    //     await buy.wait()
    //     toast({
    //       title: 'NFT(s) bought',
    //       description: `You successfully bought NFT #${tokenI}`,
    //       status: 'success',
    //       duration: 5000,
    //       isClosable: true,
    //     })
    //   }
    //   catch {
    //     toast({
    //       title: 'Error',
    //       description: `The transaction to buy NFT #${tokenIn} failed, please try again...`,
    //       status: 'error',
    //       duration: 5000,
    //       isClosable: true,
    //     })
    //   }
    //   setIsLoading(false);
  }

  // To get infos & NFT of the collection
  const getCollection = async () => {
    const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider);
    const price = await contract.getPrice();
    const maxSupply = await contract.getMaxSupply();
    const currentSupply = await contract.totalSupply();
    const name = await contract.name();

    let collectionNfts = []
    // change i= 1 to i = 0 when test(json/image) will be updated with 0.png/0.json
    for (let i = 1; i < parseInt(currentSupply.toString()); i++) {
      // console.log('token' + i);
      const rawUri = await contract.tokenURI(i)
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
        // console.log(name)
        // console.log(desc)
        // console.log(image)
        //console.log(attributes)
        //console.log(attributes.length)
        // for (let i = 0; i < attributes.length; i++) {
        //   console.log(attributes[i].trait_type + ': ' + attributes[i].value)
        // }
        let nft = {
          name: name,
          img: image,
          tokenId: i,
          desc: desc,
          attributes: attributes,
          // price
        }
        collectionNfts.push(nft)
      })
    }
    await new Promise(r => setTimeout(r, 300));
    setNfts(collectionNfts)
    console.log(nfts)
    setNftLoaded(true);
    setPrice(ethers.utils.formatEther(price).toString());
    setMaxSupply(maxSupply.toString());
    const remainingSupply = maxSupply.sub(currentSupply);
    setRemainingSupply(remainingSupply.toString());
    setName(name);
  }

  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Collection {name}
          </Heading>

          <Flex direction="column" w="100%" ms="10" color="white">
            <Box fontSize='lg'>
              <Text>Mint price: {price} ETH</Text>
            </Box>
            <Box fontSize='lg'>
              Maximum supply: {maxSupply}
            </Box>
            <Box fontSize='lg'>
              Remaining supply: {remainingSupply}
            </Box>
            <Box fontSize='lg'>
              Description: {nftLoaded && nfts[0].desc}
            </Box>
          </Flex>

          <Flex w="100%" mt='5'>
            {nfts.length > 0 && nftLoaded ? (

              nfts.map(nft => (
                <Card maxW='xs' key={nfts.indexOf(nft)} ms="5" mb="5">
                  <CardBody p="3">
                    <Image
                      src={nft.img}
                      alt='nft image'
                      borderRadius='lg'
                    />
                    <Flex mt='2' direction="column">
                      <Heading size='md'>NFT #{nfts.indexOf(nft) + 1}</Heading>
                      <Flex alignItems="center">
                        <Text fontSize='2xl'>
                          0.001
                        </Text>
                        <Text color='purple.500' fontSize='2xl' ms="2">
                          ETH
                        </Text>
                      </Flex>
                    </Flex>
                  </CardBody>
                  <Divider />
                  <CardFooter>
                    <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => buyNFT()}>
                      Buy now
                    </Button>
                  </CardFooter>
                </Card>
              ))

            ) : <Text ms="5">Loading or NFT in mint phase</Text>}
          </Flex>
        </Flex>
      ) : <Text fontSize='3xl' mt="10">Please connect</Text>}
    </Flex>
  )
}
