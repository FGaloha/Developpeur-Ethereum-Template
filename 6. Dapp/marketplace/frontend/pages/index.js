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

  useEffect(() => {
    if (isConnected) {
      //getData()
    }
  }, [isConnected, address])

  return (

    <Flex w="100%" m="0px" border="2px" bg="black" rounded="xl" p="1">
      {isConnected ? (
        <Flex direction="column" alignItems="center" justifyContent="top" w="100%">
          <MintCards />
          <CollectionsCards />
        </Flex >
      )
        : (
          <Flex w="100%">
            <Flex w="60%" alignItems="start" justifyContent="start">
              <Image boxSize="100%" src='https://bafybeicmcpfedaimwgwtfzlxzy7uy5ru4dsybyz7ymy5e7waef7ayxpozq.ipfs.nftstorage.link/' alt='Morpheus Inc Oneiroi homepage' />
            </Flex>
            <Flex direction="column" alignItems="center" justifyContent="center" width="40%">
              <Flex ></Flex>
              <Flex direction="column" alignItems="center" justifyContent="center" bg="purple.600" p="30" color="black" rounded="lg">
                <Text fontSize='6xl' >Live The Magic</Text>
                <Text fontSize='6xl'>Join the Club</Text>
              </Flex>
              <Flex></Flex>
            </Flex>
          </Flex>
        )
      }
    </Flex>

  )
}
