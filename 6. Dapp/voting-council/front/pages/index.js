import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { Box, Heading, Flex, Text, Textarea, Input, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useState, useEffect } from 'react'
import { useAccount, useProvider, useSigner } from 'wagmi'
import Contract from "../contract/Voting"
import { ethers } from 'ethers'
import Link from 'next/link'
import { Workflow } from '@/components/Forms/Workflow';
import useMembersProvider from '@/hooks/useMembersProvider'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  // Smart Contract address
  //const env = process.env.NODE_ENV
  //const contractAddress = (env == 'production') ? process.env.NEXT_PUBLIC_NETWORK_GOERLI : process.env.NEXT_PUBLIC_NETWORK_HARDHAT
  // const contractAddress = process.env.NEXT_PUBLIC_NETWORK_GOERLI

  // WAGMI
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()

  // CHAKRA-UI
  const toast = useToast()

  // CONTEXT
  const { owner, workflow, setWorkflow, contractAddress, registered, setRegistered, isMember, setIsMember } = useMembersProvider()
  //const [owner, setOwner] = useState(null)
  //const [workflow, setWorkflow] = useState(null)

  useEffect(() => {
    if (isConnected) {
      getData()
    }
  }, [isConnected, address])

  const getData = async () => {
    console.log("dans get data index")
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    // const owner = await contract.owner()
    // setOwner(owner)
    const worflowStatus = await contract.workflowStatus()
    setWorkflow(worflowStatus)


  }

  const launchNextPhase = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
    let nextPhase
    switch (workflow) {
      case 1:
        nextPhase = await contract.endProposalsRegistering()
        break;
      case 2:
        nextPhase = await contract.startVotingSession()
        break;
      case 3:
        nextPhase = await contract.endVotingSession()
        break;
      case 4:
        nextPhase = await contract.tallyVotes()
        break;
      default:
        nextPhase = await contract.startProposalsRegistering()
        break;
    }
    getData()
    //console.log(workflow)
  }

  return (
    <Flex
      w="100%" m="0px" p="0px"
      // direction={["column", "column", "row", "row"]}
      // alignItems={["center", "center", "flex-start", "flex-start"]}
      // flexWrap="wrap"
      border="2px"
    >
      {isConnected ? (
        <Flex height="100%" w="100%" alignItems="start" justifyContent="start" border="2px">
          {address == owner ? (
            <Flex direction="column">
              <Workflow w="100%" workflow={workflow} contractAddress={contractAddress} launchNextPhase={launchNextPhase} getData={getData} />
            </Flex>
          ) :

            (isMember ? (<Text> Un membre</Text>) : (<Text>Un visiteur</Text>))
          }

        </Flex>
      )
        : (
          <Flex height="100%" width="100%" alignItems="center" justifyContent="center">
            <Alert status='warning' width="300px">
              <AlertIcon />
              <Flex direction="column">
                <Text as='span'>Please connect your Wallet</Text>
              </Flex>
            </Alert>
          </Flex>
        )}

    </Flex>
  )
}
