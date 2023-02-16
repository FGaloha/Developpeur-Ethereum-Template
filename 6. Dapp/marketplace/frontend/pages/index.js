import { Heading, Flex, Text, Image, Box } from '@chakra-ui/react';
import { useEffect } from 'react'
import { useAccount, useProvider } from "wagmi";
import ContractFactory from "../contracts/Factory"
import { ethers } from 'ethers'
import { MintCards } from "@/components/Cards/MintCards"
import { CollectionsCards } from "@/components/Cards/CollectionsCards"
import useMembersProvider from '@/hooks/useMembersProvider'

export default function Home() {

  // Wagmi
  const { address, isConnected } = useAccount()
  const provider = useProvider()

  // Context
  const { contractAddressFactory, setSubsidiaries, subsidiaries, isSubsidiary, setIsSubsidiary } = useMembersProvider()

  useEffect(() => {
    if (isConnected) {
      //getData()
    }
  }, [isConnected, address])

  // const getData = async () => {
  //   // const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
  //   // const worflowStatus = await contract.workflowStatus()
  //   getSubsidiaries();
  //   checkIsSubsidiary();
  //   //console.log(isSubsidiary);
  // }

  // To get existing subsidiaries
  // const getSubsidiaries = async () => {
  //   const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

  //   // Production: to get events by 3000 blocks from contract block number 84?????
  //   let registeredSubsidiariesEvents = [];
  //   const startBlock = 0; // change with block number address addiction for production
  //   const endBlock = await provider.getBlockNumber();

  //   for (let i = startBlock; i < endBlock; i += 3000) {
  //     const _startBlock = i;
  //     const _endBlock = Math.min(endBlock, i + 2999);
  //     const data = await contract.queryFilter('SubsidiaryAdded', _startBlock, _endBlock);
  //     registeredSubsidiariesEvents = [...registeredSubsidiariesEvents, ...data]
  //   }
  //   setSubsidiaries(registeredSubsidiariesEvents)
  //   // console.log(subsidiaries)
  // }

  // Check if address isSubsidiary
  // const checkIsSubsidiary = async () => {
  //   let subsidiaryList = []
  //   subsidiaries.forEach(subsidiary => {
  //     subsidiaryList.push(subsidiary.args[0])
  //   })

  //   // Boolean true if address is registered
  //   setIsSubsidiary(subsidiaryList.includes(address))
  //   //console.log(subsidiaryList);
  //   //console.log(address);
  // }

  return (

    <Flex w="100%" m="0px" border="2px" bg="black" rounded="xl" p="1">
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="top" w="100%">
          <MintCards />
          <CollectionsCards />
        </Flex >
      )
        : (
          <Flex direction="column" width="100%" alignItems="center" justifyContent="center">
            <Image boxSize="100%" src='https://bafybeicmcpfedaimwgwtfzlxzy7uy5ru4dsybyz7ymy5e7waef7ayxpozq.ipfs.nftstorage.link/' alt='Morpheus Inc Oneiroi homepage' />
          </Flex>
        )
      }
    </Flex>

  )
}
