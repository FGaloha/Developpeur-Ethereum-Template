import {
  Heading, Flex, Button, useToast, Text,
  Input, Box, useColorModeValue, SimpleGrid, Image
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import ContractFactory from "../../contracts/Factory";
import { ethers } from 'ethers'
import useMembersProvider from '@/hooks/useMembersProvider'
import axios from 'axios'

export const MintCards = () => {
  // Wagmi
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  // Router
  const router = useRouter();

  // Context
  const { contractAddressFactory, blockNumberFactory } = useMembersProvider()

  // State
  const [collectionsLoaded, setCollectionsLoaded] = useState(false)
  const [collections, setCollections] = useState([])

  useEffect(() => {
    if (isConnected) {
      getCollections();
    }
  }, [isConnected])

  // To get Morpheus collections with still nfts to mint
  const getCollections = async () => {

    // Contract Factory to get collections list
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider);

    let createdCollectionsEvents = [];
    const startBlock = blockNumberFactory; // block number of the contract Factory
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('CollectionCreated', _startBlock, _endBlock);
      createdCollectionsEvents = [...createdCollectionsEvents, ...data]
    }

    // Loop on collections to check if remaining mints
    let collectionToMint = []
    for (let i = 0; i < createdCollectionsEvents.length; i++) {
      // sur une adresse appel total supply
      const contractCollection = new ethers.Contract(createdCollectionsEvents[i]['args'][1], ContractCollection.abi, provider);
      const totalSupply = await contractCollection.totalSupply();
      const maxSupply = await contractCollection.getMaxSupply();

      // if remaining mints, card generation using token 0 or template
      if (totalSupply == 0 || (totalSupply.toNumber() < maxSupply.toNumber())) {
        if (totalSupply == 0) {
          let nft = {
            // Warning : remplacer par une image start mint
            img: 'https://bafybeicflyu7beqkaelzvce4jp44ubm77dmpzf7rvxgw2eqsgmlp4eqesq.ipfs.nftstorage.link/',
            desc: 'Be first minter',
            addressCollection: createdCollectionsEvents[i]['args'][1],
          }
          collectionToMint.push(nft)
        }
        else {
          const tokenUri = await contractCollection.tokenURI(0);
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
            let image = rawImg.replace('ipfs://', 'https://ipfs.io/ipfs/')
            let nft = {
              img: image,
              desc: value.data.description,
              addressCollection: createdCollectionsEvents[i]['args'][1],
            }
            collectionToMint.push(nft)
          })
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    setCollections(collectionToMint)
    setCollectionsLoaded(true)
  }
  return (


    (collections.length > 0 && collectionsLoaded) ? (

      < Flex direction='column' alignItems='center' w='100%' backgroundColor='black'>
        <Heading w="100%" ms="10" as='h1' textAlign="start" size='lg' noOfLines={1} color='white' mt='4'>
          Mint Live !
        </Heading>

        <SimpleGrid columns={5} spacing={5} p="5" w="100%">

          {collections.map(collection => (
            <Box
              bg={useColorModeValue('white', 'gray.800')}
              maxW="lg"
              borderWidth="1px"
              rounded="lg"
              shadow="lg">

              <Image
                src={collection.img}
                alt={`Picture of 1st token or mint template`}
                roundedTop="lg"
              />

              <Box p="2" fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                <Button colorScheme='purple' onClick={() => router.push(`../../collection/mint?address=${collection.addressCollection}`)}>
                  Mint
                </Button>
              </Box>

            </Box>
          ))}

        </SimpleGrid>
      </Flex>

    ) : <Text ms="5">Loading or no NFT collections in mint phase</Text>


  )
}
