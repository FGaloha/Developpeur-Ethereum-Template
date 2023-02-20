import {
  Heading, Flex, Button, Text, Box,
  useColorModeValue, SimpleGrid, Image
} from '@chakra-ui/react';
import { useAccount, useProvider } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import ContractFactory from "../../contracts/Factory";
import { ethers } from 'ethers'
import axios from 'axios'
import useMembersProvider from '@/hooks/useMembersProvider'

export const CollectionsCards = () => {
  // Wagmi
  const { isConnected } = useAccount()
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

    // Contract Factory to get subsidiaries and their collections list
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider);

    // Subsidiaries
    let addedSubsidiariesEvents = [];
    let startBlock = blockNumberFactory; // block number of the contract Factory
    let endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('SubsidiaryAdded', _startBlock, _endBlock);
      addedSubsidiariesEvents = [...addedSubsidiariesEvents, ...data]
    }

    let createdCollectionsEvents = [];
    startBlock = blockNumberFactory; // block number of the contract Factory
    endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('CollectionCreated', _startBlock, _endBlock);
      createdCollectionsEvents = [...createdCollectionsEvents, ...data]
    }

    let collectionsBySubsidiaries = [];
    // For each subsidiary get the collections
    for (let i = 0; i < addedSubsidiariesEvents.length; i++) {
      let collectionsSubsidiary = [];

      for (let j = 0; j < createdCollectionsEvents.length; j++) {
        if (addedSubsidiariesEvents[i]['args'][0] == createdCollectionsEvents[j]['args'][3]) {

          const contractCollection = new ethers.Contract(createdCollectionsEvents[j]['args'][1], ContractCollection.abi, provider);
          const totalSupply = await contractCollection.totalSupply();

          // Deault image
          let image = 'https://bafybeicflyu7beqkaelzvce4jp44ubm77dmpzf7rvxgw2eqsgmlp4eqesq.ipfs.nftstorage.link/'

          // If existing token card generation using token 0 instead of default image
          if (totalSupply.toNumber() != 0) {
            let tokenUri = await contractCollection.tokenURI(0);
            let Uri = Promise.resolve(tokenUri)
            let getUri = await Uri.then(value => {
              let str = value
              let cleanUri = str.replace('ipfs://', 'https://nftstorage.link/ipfs/')
              let metadata = axios.get(cleanUri).catch(function (error) {
                console.log(error.toJSON());
              });
              return metadata;
            })
            let rawImg = getUri.data.image
            image = rawImg.replace('ipfs://', 'https://nftstorage.link/ipfs/')
          }

          // Information construction to be displayed in a grid
          collectionsSubsidiary.push({ index: 'index' + j, address: createdCollectionsEvents[j]['args'][1], image: image });
        }
      }
      const subsidiary = {
        name: addedSubsidiariesEvents[i]['args'][1],
        collections: collectionsSubsidiary,
      }
      collectionsBySubsidiaries.push(subsidiary)
    }

    await new Promise(r => setTimeout(r, 1000));
    setCollections(collectionsBySubsidiaries)
    setCollectionsLoaded(true)
  }

  return (

    (collections.length > 0 && collectionsLoaded) ? (

      < Flex direction='column' alignItems='center' w='100%' backgroundColor='black'>
        {collections.map(collection => (
          <Flex w="100%" direction='column'>
            <Heading w="100%" ms="5" as='h1' textAlign="start" size='lg' noOfLines={1} color='white' mt='4' key={collection.name}>
              Subsidiary {collection.name}
            </Heading>
            <SimpleGrid columns={3} spacing={5} p="5" w="100%">
              {collection.collections.map(
                cards => (
                  <Box
                    bg={useColorModeValue('white', 'gray.800')}
                    maxW="lg"
                    borderWidth="1px"
                    rounded="lg"
                    shadow="lg"
                    key={cards.index}>

                    <Image
                      src={cards.image}
                      alt={`Picture of 1st token or mint template`}
                      roundedTop="lg"
                    />

                    <Box p="2" fontSize="2xl" color={useColorModeValue('gray.800', 'white')}>
                      <Button colorScheme='purple' onClick={() => router.push(`./collection/collection/?address=${cards.address}`)}>
                        View
                      </Button>
                    </Box>

                  </Box>
                ))}
            </SimpleGrid >
          </Flex>
        ))}

      </Flex>

    ) : <Text ms="5">Loading or no NFT collections for the moment</Text>


  )
}
