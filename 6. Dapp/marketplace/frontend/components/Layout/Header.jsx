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
  const { ownerFactory, isSubsidiary, contractAddressFactory, setIsSubsidiary, blockNumberFactory } = useMembersProvider()

  // State
  const [subsidiaries, setSubsidiaries] = useState([])

  useEffect(() => {
    if (isConnected) {
      getData()
    }
  }, [isConnected, address])

  const getData = async () => {
    // const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    // const worflowStatus = await contract.workflowStatus()
    getSubsidiaries();
    checkIsSubsidiary();
    //console.log(isSubsidiary);
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
    // console.log(subsidiaries)
  }

  // Check if address isSubsidiary
  const checkIsSubsidiary = async () => {
    let subsidiaryList = []
    subsidiaries.forEach(subsidiary => {
      subsidiaryList.push(subsidiary.args[0])
    })

    // Boolean true if address is registered
    setIsSubsidiary(subsidiaryList.includes(address))
    //console.log(subsidiaryList);
    //console.log(address);
  }

  return (
    <>
      <Head>
        <title>Morpheus</title>
        <meta name="description" content="Oneiroi, marketplace powered by Morpheus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Monoton&display=swap" rel="stylesheet" />
      </Head>
      <Flex p='4' justifyContent="space-between" alignItems="center" border="2px" position="fixed" width="100%" bg="black">

        <Box>

          {/* #E313DF */}
          <Heading id='logo' size='3xl' color='purple.700'>Morpheus</Heading>

        </Box>

        {isConnected &&
          <Flex>
            <Flex me="4">
              <Link class='title' href="/" size="lg">Home</Link>
            </Flex>
            {/* <Flex me="4"><Link href="/marketplace/marketplace">Marketplace</Link></Flex> */}
            {/* Test link
            <Flex me="4"><Link href={{
              pathname: '/collection/collection',
              query: { address: '0x0f6D22Ee4c19cf80A9F31e38c5A1bEe75A40c3A1' },
            }}>Collection</Link></Flex> */}
            <Flex me="4">
              <Link class='title' href="/marketplace/wallet">Wallet</Link>
            </Flex>
            {ownerFactory == address && (<Flex me="4"><Link class='title' href="/admin">Admin</Link></Flex>)}
            {isSubsidiary && (<Flex me="4"><Link class='title' href="/subsidiary">Subsidiary</Link></Flex>)}
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
