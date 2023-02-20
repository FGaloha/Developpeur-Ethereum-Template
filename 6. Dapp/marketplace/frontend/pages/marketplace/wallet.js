import {
  Heading, Flex, Image, SimpleGrid, Button, useToast, Text, Divider,
  Card, CardBody, CardFooter, ButtonGroup
} from '@chakra-ui/react';
import { useAccount, useSigner, useProvider, useBalance } from 'wagmi'
import { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import ContractCollection from "../../contracts/Collection";
import ContractFactory from "../../contracts/Factory";
import ContractMarket from "../../contracts/Market";
import { ethers } from 'ethers'
import axios from 'axios'
import useMembersProvider from '@/hooks/useMembersProvider'

export default function Wallet() {

  // Wagmi
  const { isConnected, address } = useAccount()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const { data } = useBalance({
    address: address,
    watch: true
  })

  // Router
  const router = useRouter();

  // Chakra
  const toast = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [nfts, setNfts] = useState([])
  const [nftLoaded, setNftLoaded] = useState(false)
  const [earnings, setEarnings] = useState(0)

  useEffect(() => {
    if (isConnected) {
      getData();
    }
  }, [isConnected, address])

  // Context
  const { contractAddressFactory, contractAddressMarket, blockNumberFactory } = useMembersProvider()

  // To get Morpheus NFTs owned by the wallet connected
  const getData = async () => {

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

    // Address earnings information
    const userEarnings = await contractMarket.getEarnings(address);
    setEarnings(ethers.utils.formatEther(userEarnings));

    // Check ownership on all existing collections
    let nftsOfWallet = []
    for (let i = 0; i < createdCollectionsEvents.length; i++) {

      const contractCollection = new ethers.Contract(createdCollectionsEvents[i]['args'][1], ContractCollection.abi, provider);
      const totalSupply = await contractCollection.totalSupply();

      for (let j = 0; j < totalSupply.toNumber(); j++) {
        // if ownership token information construction
        const tokenOwner = await contractCollection.ownerOf(j);
        if (tokenOwner == address) {

          const getSale = await contractMarket.getSale(createdCollectionsEvents[i]['args'][1], j)
          const tokenUri = await contractCollection.tokenURI(j);

          const Uri = Promise.resolve(tokenUri)
          const getUri = await Uri.then(value => {
            let str = value
            //let cleanUri = str.replace('ipfs://', 'https://ipfs.io/ipfs/')
            let cleanUri = str.replace('ipfs://', 'https://nftstorage.link/ipfs/')
            let metadata = axios.get(cleanUri).catch(function (error) {
              console.log(error.toJSON());
            });
            return metadata;
          })
          let rawImg = getUri.data.image
          let name = getUri.data.name
          let desc = getUri.data.description
          // let image = rawImg.replace('ipfs://', 'https://ipfs.io/ipfs/')
          let image = rawImg.replace('ipfs://', 'https://nftstorage.link/ipfs/')
          let attributes = getUri.data.attributes

          let nft = {
            name: name,
            img: image,
            tokenId: j,
            price: ethers.utils.formatEther(getSale.price).toString(),
            desc: desc,
            attributes: attributes,
            addressCollection: createdCollectionsEvents[i]['args'][1],
          }
          nftsOfWallet.push(nft)
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    setNfts(nftsOfWallet)
    setNftLoaded(true);
  }

  // Delete NFT from list of On Sale items
  const deleteFromSale = async (collectionAddress, tokenId) => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      const removeToken = await contract.deleteFromSale(collectionAddress, tokenId)
      await removeToken.wait();
      getData();
      toast({
        title: 'NFT(s) removed',
        description: `You successfully unlisted your NFT`,
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

  // Withdraw earnings
  const withdraw = async () => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddressMarket, ContractMarket.abi, signer)
      const withdrawFunds = await contract.withdraw()
      await withdrawFunds.wait();
      getData();
      toast({
        title: 'Funds withdrawed',
        description: `You successfully withdrawed your funds ${earnings}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: `The withdrawal failed, please try again...`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <Flex direction="column" m="0px" bg="black" p="1" alignItems="center" w="100%" rounded='xl'>
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="center" w="100%">
          <Heading as='h1' size='xl' noOfLines={1} color='white' mt='4' mb='50'>
            Your NFTs
          </Heading>

          <Flex direction="column" w="100%" ms="10" color="white">
            <Text>Wallet: {address.substring(0, 5)}...{address.substring(address.length - 4)}</Text>
            <Flex mt="2">
              <Text>Earnings : {earnings} ETH</Text>
              {earnings > 0 && <Button ms="4" size='xs' isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => withdraw()}>Withdraw</Button>}
            </Flex>

          </Flex>

          <Flex w="100%" mt='5'>
            {nfts.length > 0 && nftLoaded ? (
              <SimpleGrid columns={4} spacing={5} p="5" w="100%">
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
                      {nft.price == 0 ? (
                        <Button m="2" colorScheme='purple' onClick={() => router.push(`./list/?address=${nft.addressCollection}&tokenId=${nft.tokenId}`)}>
                          List
                        </Button>
                      )
                        : (
                          <ButtonGroup>
                            <Button ms="2" my="2" colorScheme='purple' onClick={() => router.push(`./update/?address=${nft.addressCollection}&tokenId=${nft.tokenId}`)}>
                              Update
                            </Button>
                            <Button ms="" my="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='purple' onClick={() => deleteFromSale(nft.addressCollection, nft.tokenId)}>
                              Unlist
                            </Button>
                          </ButtonGroup>
                        )}
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>

            ) : <Text ms="5">Loading or no NFT</Text>}
          </Flex>
        </Flex>
      ) : <Text fontSize='3xl' mt="10" color='#E313DF'>Please connect your wallet</Text>}
    </Flex>
  )
}
