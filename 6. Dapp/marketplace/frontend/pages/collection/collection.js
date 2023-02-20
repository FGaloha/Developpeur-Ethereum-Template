import {
  Heading, Flex, SimpleGrid, Image,
  Button, useToast, Text, Divider,
  Card, CardBody, CardFooter, Box
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import ContractMarket from "../../contracts/Market";
import { ethers } from 'ethers'
import axios from 'axios'
import useMembersProvider from '@/hooks/useMembersProvider'

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

  // Context
  const { contractAddressMarket } = useMembersProvider()

  // State
  const [isLoading, setIsLoading] = useState(false)
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
  }, [isConnected, address])

  // To get infos & NFT of the collection
  const getCollection = async () => {
    const contract = new ethers.Contract(contractAddressCollection, ContractCollection.abi, provider);
    const price = await contract.getPrice();
    const maxSupply = await contract.getMaxSupply();
    const currentSupply = await contract.totalSupply();
    const name = await contract.name();

    // Contract Market to get NFTs on Sale
    const contractMarket = new ethers.Contract(contractAddressMarket, ContractMarket.abi, provider)

    let collectionNfts = []
    for (let i = 0; i < currentSupply.toNumber(); i++) {

      // Market infos about collections onSale/price
      const getSale = await contractMarket.getSale(contractAddressCollection, i)

      // token owner
      const owner = await contract.ownerOf(i);

      const rawUri = await contract.tokenURI(i)
      const Uri = Promise.resolve(rawUri)
      const getUri = Uri.then(value => {
        let str = value
        let cleanUri = str.replace('ipfs://', 'https://nftstorage.link/ipfs/')
        let metadata = axios.get(cleanUri).catch(function (error) {
          console.log(error.toJSON());
        });
        return metadata;
      })
      getUri.then(value => {
        let rawImg = value.data.image
        let name = value.data.name
        let desc = value.data.description
        let image = rawImg.replace('ipfs://', 'https://nftstorage.link/ipfs/')
        let attributes = value.data.attributes
        let nft = {
          name: name,
          img: image,
          tokenId: i,
          price: ethers.utils.formatEther(getSale.price).toString(),
          owner: owner.toString(),
          desc: desc,
          attributes: attributes,
        }
        collectionNfts.push(nft)
      })
    }
    await new Promise(r => setTimeout(r, 1000));
    setNfts(collectionNfts)
    setNftLoaded(true);
    setPrice(ethers.utils.formatEther(price).toString());
    setMaxSupply(maxSupply.toString());
    const remainingSupply = maxSupply.sub(currentSupply);
    setRemainingSupply(remainingSupply.toString());
    setName(name);
  }

  // Owner can delete NFT from list of On Sale items
  const deleteFromSale = async (collectionAddress, tokenId) => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      const removeToken = await contract.deleteFromSale(collectionAddress, tokenId)
      await removeToken.wait()
      toast({
        title: 'NFT(s) removed',
        description: `You successfully your unlisted NFT`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The unlisting failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  // Buy an NFT of the collection
  const buyNFT = async (tokenId, price) => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      // console.log(tokenId)
      // console.log(price)

      const buy = await contract.buyItem(contractAddressCollection, tokenId, { value: ethers.utils.parseEther(price) })
      await buy.wait()
      getCollection();
      toast({
        title: 'NFT(s) bought',
        description: `You successfully bought the NFT`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The transaction to buy the NFT failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
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
            {(nftLoaded && nfts.length > 0) &&
              <Box fontSize='lg'>
                Description: {(nftLoaded && nfts.length > 0) && nfts[0].desc}
              </Box>}
          </Flex>

          <Flex w="100%" mt='5'>
            {nfts.length > 0 && nftLoaded ? (
              <SimpleGrid columns={3} spacing={5} m="5">
                {nfts.map(nft => (
                  <Card maxW='md' key={nfts.indexOf(nft)}>
                    <CardBody p="0" borderWidth="1px"
                      rounded="lg">
                      <Image
                        src={nft.img}
                        alt='nft image'
                        roundedTop="lg"
                      />

                      <Flex m='1' direction="column">
                        <Text fontSize='xl'>{nft.name}
                          {nft.price > 0 && (<>
                            {' - ' + nft.price} ETH</>)
                          }
                        </Text>
                      </Flex>

                    </CardBody>
                    <Divider />
                    <CardFooter p='0'>
                      {nft.price > 0 ? (

                        nft.owner == address ? (
                          <Button ms='2' my='2' isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => deleteFromSale(contractAddressCollection, nft.tokenId)}>
                            Unlist
                          </Button>
                        ) : (
                          <Button ms='2' my='2' isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => buyNFT(nft.tokenId, nft.price)}>
                            Buy
                          </Button>)

                      ) : <Text ms='2' my='1' color='purple.600' fontSize='lg' as='b'>Not listed</Text>}
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            ) : <Text ms="5">Loading or NFT in mint phase</Text>}
          </Flex>
        </Flex>
      ) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>
      }
    </Flex >
  )
}
