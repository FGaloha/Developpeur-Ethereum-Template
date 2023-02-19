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
import ContractMarket from "../../contracts/Market";
import { ethers } from 'ethers'
import axios from 'axios'
import useMembersProvider from '@/hooks/useMembersProvider'
import Link from 'next/link'

export default function Wallet() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()

  // Router
  const router = useRouter();
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
      getNfts();
    }
  }, [isConnected])

  // Alchemy URL
  // const baseURL = "https://eth-goerli.g.alchemy.com/nft/v2/" + process.env.NEXT_PUBLIC_ALCHEMY_GOERLI_API_KEY;
  // const url = `${baseURL}/getNFTs/?owner=${address}`;

  // const config = {
  //   method: 'get',
  //   url: url,
  // };

  // Context
  const { contractAddressFactory, contractAddressMarket, blockNumberFactory } = useMembersProvider()

  // To get wallet's NFTs using Alchemy API
  // const getNftsAlchemy = async () => {

  //   let collectionNfts = []

  //   axios(config)
  //     .then(response => {
  //       const nftsWallet = response['data'];
  //       //console.log(nfts.ownedNfts[0].metadata)

  //       // Parse output
  //       const numNfts = nftsWallet['totalCount'];
  //       const nftList = nftsWallet['ownedNfts'];
  //       console.log(nftList[0]['contract'].address)

  //       // console.log(`Total NFTs owned by ${address}: ${numNfts} \n`);

  //       for (let i = 0; i < nftList.length; i++) {
  //         // console.log(`${i + 1}. ${nftList[i]['metadata']['name']}`)
  //         //let image = nftList[i]['metadata']['image']
  //         //if (image) { image = image.replace('ipfs://', 'https://ipfs.io/ipfs/') }
  //         let nft = {
  //           name: nftList[i]['metadata']['name'],
  //           img: nftList[i]['metadata']['image'],
  //           tokenId: nftList[i]['metadata']['id'],
  //           desc: nftList[i]['metadata']['description'],
  //           attributes: nftList[i]['metadata']['attributes'],
  //           // price
  //         }
  //         collectionNfts.push(nft)
  //         //console.log(nftList[i]['metadata']['image'])
  //       }

  //       //await new Promise(r => setTimeout(r, 300));
  //       setNfts(collectionNfts)
  //       setNftLoaded(true);
  //       //console.log(nfts);
  //       //console.log(collectionNfts);
  //     })
  //     .catch(error => console.log('error', error));


  // }

  // To get Morpheus NFTs owned by the wallet connected
  const getNfts = async () => {

    // Contract Factory to get collections list
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider);

    // Contract Market to get NFTs on Sale
    const contractMarket = new ethers.Contract(contractAddressMarket, ContractMarket.abi, provider)

    let createdCollectionsEvents = [];
    const startBlock = blockNumberFactory; // block number of the contract Factory
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('CollectionCreated', _startBlock, _endBlock);
      createdCollectionsEvents = [...createdCollectionsEvents, ...data]
    }
    //console.log(createdCollectionsEvents)

    // boucle sur les adresses
    let nftsOfWallet = []
    for (let i = 0; i < createdCollectionsEvents.length; i++) {

      // sur une adresse appel total supply
      const contractCollection = new ethers.Contract(createdCollectionsEvents[i]['args'][1], ContractCollection.abi, provider);
      // boucle sur total supply pour récupérer de 0 a supply - 1 le owner
      const totalSupply = await contractCollection.totalSupply();

      for (let j = 0; j < totalSupply.toNumber(); j++) {
        // si owner = address appel tokenUri et construction data pour affichage nft
        const tokenOwner = await contractCollection.ownerOf(j);
        if (tokenOwner == address) {

          const getSale = await contractMarket.getSale(createdCollectionsEvents[i]['args'][1], j)
          //console.log(getSale.price.toString())

          const tokenUri = await contractCollection.tokenURI(j);
          const Uri = Promise.resolve(tokenUri)
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
              tokenId: j,
              price: ethers.utils.formatEther(getSale.price).toString(),
              desc: desc,
              attributes: attributes,
              addressCollection: createdCollectionsEvents[i]['args'][1],
              // price
            }
            nftsOfWallet.push(nft)
          })
        }
        // si on sale récupération prix
      }
    }

    //console.log(nftsOfWallet)
    await new Promise(r => setTimeout(r, 1000));
    setNfts(nftsOfWallet)
    setNftLoaded(true);
    // console.log(nfts)
    //Filter to get only collections of the subsidiary
    // let nfts = [];
    // for (let i = 0; i < createdCollectionsEvents.length; i++) {
    //   const contract = new ethers.Contract(createdCollectionsEvents, ContractFactory.abi, provider);
    // }
  }

  // Delete NFT from list of On Sale items
  const deleteFromSale = async (collectionAddress, tokenId) => {
    setIsLoading(true);
    try {
      // console.log(collectionAddress)
      // console.log(tokenId)
      const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      const removeToken = await contract.deleteFromSale(collectionAddress, tokenId)
      await removeToken.wait()
      toast({
        title: 'NFT(s) removed',
        description: `You successfully unlisted NFT ${tokenId}`,
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

  return (
    <Flex direction="column" alignItems="center" w="100%" backgroundColor='black' rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Your NFTs
          </Heading>

          <Flex w="100%" ms="10" color="white">
            <Text>Wallet: {address.substring(0, 5)}...{address.substring(address.length - 4)}</Text>
          </Flex>

          <Flex w="100%" mt='5'>
            {nfts.length > 0 && nftLoaded ? (
              <SimpleGrid columns={5} spacing={5} m="5">
                {nfts.map(nft => (
                  <Card maxW='xs' key={nfts.indexOf(nft)}>
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
                    <CardFooter p="0">
                      {/* <Button isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => putOnSale()}>
                        List
                      </Button> */}
                      {nft.price == 0 ? (
                        // <Link colorScheme='purple' href={{
                        //   pathname: './list',
                        //   query: { address: nft.addressCollection, tokenId: nft.tokenId },
                        // }}>List</Link>

                        <Button m="2" colorScheme='purple' onClick={() => router.push(`./list/?address=${nft.addressCollection}&tokenId=${nft.tokenId}`)}>
                          List
                        </Button>

                      )
                        : (
                          <Button m="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => deleteFromSale(nft.addressCollection, nft.tokenId)}>
                            Unlist
                          </Button>)}
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>

            ) : <Text ms="5">Loading or NFT in mint phase</Text>}
          </Flex>
        </Flex>
      ) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
