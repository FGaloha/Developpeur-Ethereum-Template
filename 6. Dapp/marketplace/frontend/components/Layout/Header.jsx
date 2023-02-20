import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useProvider } from 'wagmi'
import { Box, Flex, Heading } from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import useMembersProvider from '@/hooks/useMembersProvider'
import React, { useState, useEffect } from "react";
import { ethers } from 'ethers'
import ContractFactory from "../../contracts/Factory"

export const Header = () => {

  // Wagmi
  const { isConnected, address } = useAccount()
  const provider = useProvider()

  // Context
  const { ownerFactory, contractAddressFactory, blockNumberFactory } = useMembersProvider()

  // State
  const [subsidiaries, setSubsidiaries] = useState([])
  const [isSubsidiary, setIsSubsidiary] = useState(false)

  useEffect(() => {
    if (isConnected) {
      getData()
    }
  }, [isConnected, address])

  const getData = async () => {
    getSubsidiaries();
    checkIsSubsidiary();
  }

  // To get existing subsidiaries
  const getSubsidiaries = async () => {
    const contract = new ethers.Contract(contractAddressFactory, ContractFactory.abi, provider)

    // Production: to get events by 3000 blocks from contract block number 84?????
    let registeredSubsidiariesEvents = [];
    const startBlock = blockNumberFactory; // change with block number address addiction for production
    const endBlock = await provider.getBlockNumber();

    for (let i = startBlock; i < endBlock; i += 3000) {
      const _startBlock = i;
      const _endBlock = Math.min(endBlock, i + 2999);
      const data = await contract.queryFilter('SubsidiaryAdded', _startBlock, _endBlock);
      registeredSubsidiariesEvents = [...registeredSubsidiariesEvents, ...data]
    }
    setSubsidiaries(registeredSubsidiariesEvents)
  }

  // Check if address isSubsidiary
  const checkIsSubsidiary = async () => {
    let subsidiaryList = []
    subsidiaries.forEach(subsidiary => {
      subsidiaryList.push(subsidiary.args[0])
    })

    // Boolean true if address is registered
    setIsSubsidiary(subsidiaryList.includes(address))
  }

  return (
    <>
      <Head>
        <title>Morpheus</title>
        <meta name="description" content="Oneiroi, marketplace powered by Morpheus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex p='4' justifyContent="space-between" alignItems="center" border="2px" position="fixed" width="100%" bg="black">

        <Box>

          <Heading id='logo' size='3xl' color='purple.700'>Morpheus</Heading>

        </Box>

        {isConnected &&
          <Flex>
            <Flex me="4">
              <Link className='title' href="/" >Home</Link>
            </Flex>
            <Flex me="4">
              <Link className='title' href="/marketplace/wallet">Wallet</Link>
            </Flex>
            {ownerFactory == address && (<Flex me="4"><Link className='title' href="/admin">Admin</Link></Flex>)}
            {isSubsidiary && (<Flex me="4"><Link className='title' href="/subsidiary">Subsidiary</Link></Flex>)}
          </Flex>
        }

        <Box>
          <Flex>
            <ConnectButton label='Log in' accountStatus='avatar' chainStatus="none" />
          </Flex>
        </Box>
      </Flex >
    </>

  )
};
