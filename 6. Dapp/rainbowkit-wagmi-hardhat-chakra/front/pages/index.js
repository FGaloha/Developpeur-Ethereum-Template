import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { ethers } from 'ethers';
import Contract from '../../back/artifacts/contracts/SimpleStorage.sol/SimpleStorage'
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Text, Input, Button, useToast, Box, Spacer, Flex, Heading } from '@chakra-ui/react';

export default function Home() {

  const env = process.env.NODE_ENV
  const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()
  const toast = useToast()

  //STATES INPUT
  const [number, setNumber] = useState(null)
  //STATES GET SC
  const [getNumber, setGetNumber] = useState(null)

  useEffect(() => {
    if (isConnected) {
      getDatas()
    }
  }, [isConnected])

  const getDatas = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    const favoriteNumber = await contract.getNumber()
    setGetNumber(favoriteNumber.toString())
  }

  const setFavoriteNumber = async () => {
    try {
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.setNumber(number)
      await transaction.wait() //= wait(1) même chose
      getDatas()
      toast({
        title: 'Congratulations!',
        description: "Your favorite number is in the blockchain",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "An error occured, please try again...",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }

  }

  return (
    <>
      <Head>
        <title>My Simple Storage Dapp</title>
        <meta name="description" content="Dapp made to store and update favorite number" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex>
        <Box p='4'><Heading>Welcome to Simple Storage</Heading></Box>
        <Spacer />
        <Box p='4'>
          <ConnectButton label="Log in" accountStatus="avatar" />
        </Box>
      </Flex>

      <Flex>
        <Box p='4'>
          {
            isConnected ? (
              <>
                <Text pb='4' color='green'>Vous êtes bien connecté ! {address}</Text>
                <Text pb='4'>Favorite Number : {getNumber}</Text>
                <Flex>
                  <Input width='auto' mr='2' placeholder="Your favorite Number" onChange={(e) => setNumber(e.target.value)} />
                  <Button border='1px' onClick={() => setFavoriteNumber()}>Set Number</Button>
                </Flex>
              </>
            ) : (
              <Heading as='h4' size='md' color='red'>Merci de vous connecter !!! :(</Heading>
            )
          }
        </Box>
      </Flex>
    </>
  )
}
