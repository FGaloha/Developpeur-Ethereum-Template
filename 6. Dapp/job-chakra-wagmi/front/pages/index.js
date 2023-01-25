import Head from 'next/head'
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi'
//import { ethers } from 'ethers'
import {
  Flex, Heading
} from '@chakra-ui/react';
import { Navbar } from '@/components/Navbar/Navbar'
import { Add } from '@/components/Add/Add'
import { ListActive } from '@/components/List/ListActive';
import { ListClosed } from '@/components/List/ListClosed';

export default function Home() {

  const env = process.env.NODE_ENV
  const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI
  const { address, isConnected } = useAccount()
  const [add, setAdd] = useState(false);
  const [listActive, setListActive] = useState(false);
  const [listClosed, setListClosed] = useState(false);

  useEffect(() => {
    if (isConnected) {
      setListActive(true)
      setAdd(false)
      setListClosed(false)
      alert(env)
      alert(contractAddress)
    }
  }, [isConnected, address])

  return (
    <>
      <Head>
        <title>FG Job Dapp</title>
        <meta name="description" content="Dapp made to store and update jobs" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar isConnected={isConnected} changeAdd={setAdd} changeActive={setListActive} changeClosed={setListClosed} />

      <Flex p='10' w="100%" alignItems="center" justifyContent="center">

        {
          isConnected ? (
            <>
              {add &&
                <Add address={address} contractAddress={contractAddress} />
              }
              {listActive &&
                <ListActive address={address} contractAddress={contractAddress} />
              }
              {listClosed &&
                <ListClosed contractAddress={contractAddress} />
              }
            </>
          ) : (
            <Heading pt="4" size='md' color='red'>Connect your wallet to start using the service.</Heading>
          )
        }
      </Flex>
    </>
  )
}
