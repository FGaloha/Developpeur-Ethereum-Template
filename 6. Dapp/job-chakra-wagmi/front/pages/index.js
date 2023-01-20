import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { ethers } from 'ethers';
import Contract from '../../back/artifacts/contracts/Jobs.sol/Jobs'
import { useState, useEffect } from 'react';
import { useAccount, useProvider, useSigner, useContractEvent } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Text, Input, Button, useToast, Box, Spacer, Flex, Heading
} from '@chakra-ui/react';

export default function Home() {

  const env = process.env.NODE_ENV
  const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()
  const toast = useToast()

  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (isConnected) {
      getDatas();
    }
  }, [isConnected])



  // async function setGetDepositEvent() {
  //   const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
  //   contract.on("Deposit", (from, to, value, event) => {
  //     let depositEvent = {
  //       from: from,
  //       to: to,
  //       value: value,
  //       // timestamp: timestamp,
  //       eventData: event,
  //     }
  //     console.log('Deposit made on block ' + depositEvent.eventData.blockNumber)
  //   })
  //   console.log('I set up the Deposit listening')
  // }

  const getDatas = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
    // user balance displayed after connection
    setBalance((await provider.getBalance(contractAddress)).toString());
    //setGetBalance(ethers.utils.formatEther(balance).toString())
    // all smart contract events
    //setEvents(await contract.queryFilter('*'))
    // last 10 smart contract events
    //devrait-on simplifier le contenu?
    //setSmartEvents(await contract.queryFilter('*', -10, 'latest'))
    // TimeStamp in french format
    // console.log(new Intl.DateTimeFormat('fr-FR').format(smartEvents[0].args[2] * 1000))
    // console.log(events[0].address)
    // console.log(events[0].event)
    // console.log(ethers.utils.formatEther(events[0].args[1].toString()))
  }

  // const sendEthers = async () => {
  //   setIsLoadingDeposit(true);
  //   try {
  //     const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
  //     const depositByUser = ethers.utils.parseEther(amountDeposit)
  //     //parser le montant en ether pour envoyer des wei
  //     let transaction = await contract.sendEthers({ value: depositByUser });
  //     await transaction.wait()
  //     getDatas()
  //     document.getElementById('depositInput').value = null

  //     toast({
  //       title: 'Congratulations!',
  //       description: `You send successfully ${amountDeposit} ethers`,
  //       status: 'success',
  //       duration: 9000,
  //       isClosable: true,
  //     })
  //   }
  //   catch {
  //     toast({
  //       title: 'Error',
  //       description: "The deposit did not succeed, please try again...",
  //       status: 'error',
  //       duration: 9000,
  //       isClosable: true,
  //     })
  //   }
  //   setIsLoadingDeposit(false);
  // }



  return (
    <>
      <Head>
        <title>FG Job Dapp</title>
        <meta name="description" content="Dapp made to store and update jobs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex>
        <Box p='4'><Heading size='lg'>Welcome to the FG Job Dapp</Heading></Box>
        <Spacer />
        <Box p='4'>
          <ConnectButton label='Log in' accountStatus='avatar' />
        </Box>
      </Flex>

      <Flex>
        <Box p='4'>
          {
            isConnected ? (
              <>
                <Text pb='4' color='green'>Hello {address}</Text>
                <Text pb='4'>Contract balance {balance}</Text>
                {/* <Text pb='4'>Your current balance is : {getBalance}</Text>

                <Heading pb='2'>Deposit</Heading>
                <Flex pb='4'>
                  <Input id='depositInput' width='auto' mr='2' placeholder="Amount in ETH" onChange={(e) => setAmountDeposit(e.target.value)} />
                  <Button isLoading={isLoadingDeposit ? 'isLoading' : ''} loadingText='Loading' colorScheme='green' border='1px' onClick={() => sendEthers()}>Deposit</Button>
                </Flex> */}

              </>
            ) : (
              <Heading as='h4' size='md' color='red'>Connect your wallet to start using the service.</Heading>
            )
          }
        </Box>
      </Flex>
    </>
  )
}
