import { Inter } from '@next/font/google'
import { Button, Heading, Flex, Text, useToast, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react'
import { useAccount, useProvider, useSigner } from 'wagmi'
import Contract from "../contract/History"
import { ethers } from 'ethers'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  // Smart Contract address
  const env = process.env.NODE_ENV
  const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  // WAGMI
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()

  // CHAKRA-UI
  const toast = useToast()

  const [isLoading, setIsLoading] = useState()

  useEffect(() => {
    if (isConnected) {
      getData()
    }
  }, [isConnected, address])

  const getData = async () => {
    // const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    // const worflowStatus = await contract.workflowStatus()
    // setWorkflow(worflowStatus)
    // // List of registered address
    // const registeredEvents = await contract.queryFilter('VoterRegistered', 0, 'latest')
    // let registeredList = []
    // registeredEvents.forEach(registeredEvent => {
    //   registeredList.push(registeredEvent.args[0])
    // })
    // setRegistered(registeredList)
  }

  const mint = async (quantity) => {
    setIsLoading(true);
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      const mint = await contract.mint(quantity)
      await mint.wait()
      // getData()
      toast({
        title: 'New NFT',
        description: `You successfully minted a NFT`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "The mint failed, please try again...",
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setIsLoading(false);
  }

  return (
    <Flex w="100%" m="0px" p="0px" border="2px" bg="black">
      <Button ms="2" isLoading={isLoading ? 'isLoading' : ''} loadingText='Loading' colorScheme='whatsapp' onClick={() => mint(1)}>Mint</Button>
    </Flex>
  )
}
