import {
  Heading, Flex, NumberInput,
  SimpleGrid, NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper, Image,
  NumberDecrementStepper, Button, ButtonGroup, useToast, Text, Divider,
  Card, CardHeader, CardBody, CardFooter, Box, Stack, StackDivider
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import ContractFactory from "../../contracts/Factory";
import { ethers } from 'ethers'
import axios from 'axios'

export default function Wallet() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // Router
  // const router = useRouter();
  // const query = router.query;
  //const contractAddressCollection = query.address;

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
      //getNfts();
    }
  }, [isConnected])

  // Alchemy URL
  const baseURL = "https://eth-goerli.g.alchemy.com/nft/v2/" + process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_API_KEY;
  const url = `${baseURL}/getNFTs/?owner=${address}`;

  const config = {
    method: 'get',
    url: url,
  };

  // To get wallet's NFTs using Alchemy API
  const getNftsAlchemy = async () => {

    let collectionNfts = []

    axios(config)
      .then(response => {
        const nftsWallet = response['data'];
        //console.log(nfts.ownedNfts[0].metadata)

        // Parse output
        const numNfts = nftsWallet['totalCount'];
        const nftList = nftsWallet['ownedNfts'];
        console.log(nftList[0]['contract'].address)

        // console.log(`Total NFTs owned by ${address}: ${numNfts} \n`);

        for (let i = 0; i < nftList.length; i++) {
          // console.log(`${i + 1}. ${nftList[i]['metadata']['name']}`)
          //let image = nftList[i]['metadata']['image']
          //if (image) { image = image.replace('ipfs://', 'https://ipfs.io/ipfs/') }
          let nft = {
            name: nftList[i]['metadata']['name'],
            img: nftList[i]['metadata']['image'],
            tokenId: nftList[i]['metadata']['id'],
            desc: nftList[i]['metadata']['description'],
            attributes: nftList[i]['metadata']['attributes'],
            // price
          }
          collectionNfts.push(nft)
          //console.log(nftList[i]['metadata']['image'])
        }

        //await new Promise(r => setTimeout(r, 300));
        setNfts(collectionNfts)
        setNftLoaded(true);
        //console.log(nfts);
        //console.log(collectionNfts);
      })
      .catch(error => console.log('error', error));


  }

  // Buy an NFT of the collection
  const buyNFT = async () => {
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
      //

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
            Your NFTs {address}
          </Heading>

          {/* <Flex direction="column" w="100%" ms="10" color="white">
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
          </Flex> */}

          <Flex w="100%" mt='5'>
            {nfts.length > 0 && nftLoaded ? (
              <SimpleGrid columns={3} spacing={5}>
                {nfts.map(nft => (
                  <Card maxW='xs' key={nfts.indexOf(nft)} ms="5" mb="5">
                    <CardBody p="3">
                      <Image
                        src=//'https://ipfs.io/ipfs/bafybeid7wtd3h5s6lgmjyccv2gbcvgyumkiwgql64mh34xruxyxe2ttzhe/2.png'
                        {nft.img}
                        alt='nft image'
                        borderRadius='lg'
                      />
                      <Flex mt='2' direction="column">
                        <Heading size='md'>NFT #{nft.tokenId}</Heading>
                        <Flex alignItems="center">
                          <Text fontSize='2xl'>
                            0.001
                          </Text>
                          <Text color='purple.500' fontSize='2xl' ms="2">
                            ETH {nft.description}
                          </Text>
                        </Flex>
                      </Flex>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                      <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => buy()}>
                        Buy now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            ) : <Text ms="5">Loading or no NFT for the moment</Text>}
          </Flex>
        </Flex>
      ) : <Text fontSize='3xl' mt="10">Please connect</Text>}
    </Flex>
  )
}
