import { Heading, Flex } from '@chakra-ui/react';
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { useRouter } from "next/router";

export default function updateCollection() {

  // Wagmi
  const { isConnected } = useAccount()

  // Router
  const router = useRouter();
  const addressCollection = router.query;

  useEffect(() => {
    if (isConnected) {
      //console.log(addressCollection)
      //get collection info
    }
  }, [isConnected])

  // To get collection info

  // To update the collection
  // const updateCollection = async () => {
  //   const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

  //   let createdCollectionsEvents = [];
  //   const startBlock = 0; // block number of the contract Factory
  //   const endBlock = await provider.getBlockNumber();

  //   for (let i = startBlock; i < endBlock; i += 3000) {
  //     const _startBlock = i;
  //     const _endBlock = Math.min(endBlock, i + 2999);
  //     const data = await contract.queryFilter('CollectionCreated', _startBlock, _endBlock);
  //     createdCollectionsEvents = [...createdCollectionsEvents, ...data]
  //   }

  //   //Filter to get only collections of the subsidiary
  //   let subsidiaryCollections = [];
  //   for (let i = 0; i < createdCollectionsEvents.length; i++) {
  //     if (createdCollectionsEvents[i].args[3] == address) {
  //       subsidiaryCollections.push([createdCollectionsEvents[i].args[0], createdCollectionsEvents[i].args[1], createdCollectionsEvents[i].args[2], createdCollectionsEvents[i].args[3]]);
  //     }
  //   }
  //   setCollections(subsidiaryCollections)
  // }

  return (
    //isConnected &&
    <Flex direction="column" alignItems="center" w="100%">
      <Heading as='h1' size='xl' noOfLines={1} color="black">
        Update collection
      </Heading>
    </Flex>
  )
}
